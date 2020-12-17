import {readdir, readFile, writeFile} from 'fs';
import {join} from 'path';
import {promisify} from 'util';

export class ServicesService {

    /**
     *
     * @param storageService {StorageUtil}
     */
    constructor(storageService) {
        this.storageService = storageService;
    }

    async getServices(projectName, moduleName) {
        try {
            const projectPath = this.storageService.getConfig(`${projectName}:projectPath`);
            const servicesDir = join(projectPath, 'modules', moduleName, 'services');
            return promisify(readdir)(servicesDir);
        } catch (e) {
            return [];
        }
    }

    /**
     *
     * @param serviceName - {string} service name
     * @param project - {string} current project
     * @param module - {string} current module
     * @return {Promise<void>}
     */
    async serviceFileToJson(serviceName, project, module) {
        if (serviceName.toString().includes('.service.ts')) {
            serviceName = serviceName.toString().split('.')[0];
        }
        const projectPath = this.storageService.getConfig(`${project}:projectPath`);
        const serviceFile = await promisify(readFile)(join(projectPath, 'modules', module, 'services', `${serviceName}.service.ts`));
        const serviceJsonFile = {};
        serviceJsonFile.name = serviceName;
        serviceJsonFile.injections = this._getInjectionsFromServiceFile(serviceFile);
        serviceJsonFile.methods = this._getMethodsFromServiceFile(serviceFile);
        return serviceJsonFile;
    }

    /**
     *
     * @param service - {{
     *     name: string,
     *     injections: {
     *         name: string,
     *         service: string
     *     }[],
     *     methods: {
     *         name: string,
     *         inputs: string,
     *         return: string,
     *         body: string
     *     }[]
     * }}
     * @param project - {string}
     * @param module - {string}
     * @return {Promise<any>}
     */
    async jsonToServiceFile(service, project, module) {
        const projectPath = this.storageService.getConfig(`${project}:projectPath`);
        const serviceInjectionsWithType = service.injections
            .map(x => 'private readonly ' + x.name + ': ' + this._firstCaseUpper(x.service) + 'Service')
            .join(',');
        const methods = service.methods.map(x => {
            return `
    async ${x.name}(${x.inputs}) : Promise<any>{
        ${x.body}
    }`
        }).join('\n');

        await promisify(writeFile)(join(projectPath, 'modules', module, 'services', `${service.name}.service.ts`),
            `import {bfast, BFast} from 'bfast';
import {Injectable} from '@angular/core';
${this._getServiceImports(service.injections)}

@Injectable({
    providedIn: 'any'
)
export class ${this._firstCaseUpper(service.name)}Service {
    constructor(${serviceInjectionsWithType}){
    }
    
    ${methods}
}
            `);
        return 'done write service'
    }

    _getServiceImports(injections = []) {
        let im = '';
        for (const injection of injections) {
            const serviceName = this._firstCaseUpper(injection.service)
            im += `import {${serviceName}Service} from './services/${injection.service.toLowerCase()}.service.ts'\n`
        }

        return im;
    }

    _firstCaseUpper(name) {
        return name.toLowerCase().split('').map((value, index, array) => {
            if (index === 0) {
                return value.toUpperCase();
            }
            return value;
        }).join('');
    }

    _getInjectionsFromServiceFile(serviceFile) {
        const reg = new RegExp('constructor\\(.*\\)');
        const results = serviceFile.toString().match(reg) ? serviceFile.toString().match(reg)[0] : [];
        if (results) {
            return results.toString()
                .replace(new RegExp('(constructor\\()*(private)*(readonly)*\\)*', 'gim'), '')
                .split(',')
                .filter(x => x !== '')
                .map(x => {
                    return {
                        name: x.split(':')[0] ? x.split(':')[0].trim() : '',
                        service: x.split(':')[1] ? x.split(':')[1].replace('Service', '').toLowerCase().trim() : ''
                    }
                });
        } else {
            return [];
        }
    }

    _getMethodsFromServiceFile(serviceFile) {
        const reg = new RegExp(`(async)+.*`, 'gim');
        const results = serviceFile.toString().match(reg) ? serviceFile.toString().match(reg) : [];
        const indexes = results.map(x => {
            return serviceFile.toString().indexOf(x);
        }).filter(x => x > 0);
        const methods = indexes.map((value, index, array) => {
            if (index === indexes.length - 1) {
                let closingTag = serviceFile.toString().lastIndexOf("}");
                return serviceFile.toString().substring(value, closingTag);
            }
            return serviceFile.toString().substring(value, indexes[index + 1]);
        });
        if (methods) {
            return methods.map(x => {
                const inputsMatch = x.toString().trim().match(new RegExp("\\(.*\\)"));
                let inputs = inputsMatch ? inputsMatch.toString() : '';
                inputs = inputs.substring(1, inputs.length - 1)
                return {
                    name: x.toString().trim().match(new RegExp('^[\\w\\d\\s]*')).toString().replace("async", "").trim(),
                    inputs: inputs.trim(),
                    return: "any",
                    body: x.toString().replace(new RegExp('(async)+.*|}', 'gim'), '').trim()
                }
            });
        } else {
            return [];
        }
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param serviceName - {string}
     */
    async createService(project, module, serviceName) {
        serviceName = serviceName.toString().replace('.service.ts', '');
        const services = await this.getServices(project, module);
        const exists = services.filter(x => x === serviceName.toString().concat('.service.ts'));
        if (exists && Array.isArray(services) && exists.length > 0) {
            throw new Error('Service already exist');
        } else {
            return this.jsonToServiceFile({name: serviceName, injections: [], methods: []}, project, module);
        }
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param service - {string}
     * @param method - {{
     *     name: string,
     *     inputs: string,
     *     return: string,
     *     body: string
     * }}
     * @return {Promise<void>}
     */
    async addMethod(project, module, service, method) {
        service = service.toString();
        const serviceJson = await this.serviceFileToJson(service, project, module);
        const exists = serviceJson.methods.filter(x => x.name === method.name.toString());
        if (exists && Array.isArray(exists) && exists.length > 0) {
            throw new Error('Service method already exist');
        } else {
            serviceJson.methods.push(method);
            return this.jsonToServiceFile(serviceJson, project, module);
        }
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param service - {string}
     * @param method - {string}
     * @return {Promise<any>}
     */
    async getMethod(project, module, service, method) {
        const serviceJson = await this.serviceFileToJson(service, project, module);
        const exists = serviceJson.methods.filter(x => x.name === method.toString());
        if (exists && Array.isArray(exists) && exists.length > 0) {
            return exists[0];
        } else {
            throw new Error('Service method does not exist');
        }
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param service - {string}
     * @param method - {string}
     * @param update - {{
     *     name: string,
     *     inputs: string,
     *     body: string,
     *     return: string
     * }}
     * @return {Promise<any>}
     */
    async updateMethod(project, module, service, method, update) {
        const serviceJson = await this.serviceFileToJson(service, project, module);
        serviceJson.methods = serviceJson.methods.map(x => {
            if (x.name === method.toString()) {
                return update;
            } else {
                return x;
            }
        });
        return this.jsonToServiceFile(serviceJson, project, module);
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param service - {string}
     * @param method - {string}
     * @return {Promise<any>}
     */
    async deleteMethod(project, module, service, method) {
        const serviceJson = await this.serviceFileToJson(service, project, module);
        serviceJson.methods = serviceJson.methods.filter(x => x.name !== method.toString());
        return this.jsonToServiceFile(serviceJson, project, module);
    }
}
