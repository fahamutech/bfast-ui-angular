import {readdir, readFile, writeFile} from 'fs';
import {join} from 'path';
import {promisify} from 'util';
import {AppUtil} from "../utils/app.util.mjs";

export class ServicesService {

    /**
     *
     * @param storageService {StorageUtil}
     * @param appUtil {AppUtil}
     */
    constructor(storageService, appUtil) {
        this.storageService = storageService;
        this.appUtil = appUtil;
    }

    /**
     *
     * @param project
     * @param module
     * @return {Promise<string[]>}
     */
    async getServices(project, module) {
        try {
            const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
            const servicesDir = join(projectPath, 'modules', module, 'services');
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
     * @return {Promise<{
     *     name: string,
     *     injections: Array<*>,
     *     imports: Array<{name: string, type: string, ref: string}>,
     *     methods: Array<*>,
     * }>}
     */
    async serviceFileToJson(project, module, serviceName) {
        if (serviceName.toString().includes('.service.ts')) {
            serviceName = serviceName.toString().split('.')[0];
        }
        const projectPath =await this.storageService.getConfig(`${project}:projectPath`);
        const serviceFile = await promisify(readFile)(join(projectPath, 'modules', module, 'services', `${serviceName}.service.ts`));
        const serviceJsonFile = {};
        serviceJsonFile.name = serviceName;
        serviceJsonFile.injections = this.appUtil.getInjectionsFromFile(serviceFile);
        serviceJsonFile.imports = this._getUserImportsServiceFile(serviceFile);
        serviceJsonFile.methods = this.appUtil.getMethodsFromFile(serviceFile);
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
    async jsonToServiceFile(project, module, service) {
        const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
        const serviceInjectionsWithType = service.injections
            .map(x => 'private readonly ' + x.name + ': ' + this.appUtil.firstCaseUpper(x.service) + 'Service')
            .join(',');
        const methods = service.methods.map(x => {
            return `
    async ${x.name}(${x.inputs}): Promise<any> {
        ${x.body.toString().trim()}
    }`
        }).join('\n');

        await promisify(writeFile)(join(projectPath, 'modules', module, 'services', `${service.name}.service.ts`),
            `import {bfast, BFast} from 'bfastjs';
import {Injectable} from '@angular/core';
${this._getServiceImports(service.injections)}
${this._getExternalLibImports(service.imports)}

@Injectable({
    providedIn: 'any'
})
export class ${this.appUtil.firstCaseUpper(service.name)}Service {
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
            const serviceName = this.appUtil.firstCaseUpper(injection.service)
            im += `import {${serviceName}Service} from './${injection.service.toLowerCase()}.service';\n`
        }

        return im;
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
            return this.jsonToServiceFile(project, module, {
                name: serviceName,
                injections: [],
                methods: [],
                imports: []
            });
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
        const serviceJson = await this.serviceFileToJson(project, module, service);
        const exists = serviceJson.methods.filter(x => x.name === method.name.toString());
        if (exists && Array.isArray(exists) && exists.length > 0) {
            throw new Error('Service method already exist');
        } else {
            serviceJson.methods.push(method);
            return this.jsonToServiceFile(project, module, serviceJson);
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
        const serviceJson = await this.serviceFileToJson(project, module, service);
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
        const serviceJson = await this.serviceFileToJson(project, module, service);
        serviceJson.methods = serviceJson.methods.map(x => {
            if (x.name === method.toString()) {
                return update;
            } else {
                return x;
            }
        });
        return this.jsonToServiceFile(project, module, serviceJson);
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
        const serviceJson = await this.serviceFileToJson(project, module, service);
        serviceJson.methods = serviceJson.methods.filter(x => x.name !== method.toString());
        return this.jsonToServiceFile(project, module, serviceJson);
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param service - {string} current service which want injection
     * @return {Promise<*>}
     */
    async getInjections(project, module, service) {
        const allServices = await this.getServices(project, module);
        return allServices.filter(x => x !== service);
    }

    _getUserImportsServiceFile(serviceFile) {
        const reg = new RegExp('(import).*(.|\\n)*(from).*;', 'ig');
        let results = serviceFile.toString().match(reg) ? serviceFile.toString().match(reg)[0] : [];
        if (results) {
            results = results.toString()
                // remove angular core imports
                .replace(new RegExp('(import).*(@angular).*;', 'ig'), '')
                // remove component imports
                .replace(new RegExp('(import).*(\\.service).*;', 'ig'), '')
                // remove bfast imports
                .replace(new RegExp('(import).*(bfastjs).*;', 'ig'), '')
                // remove space left behind
                .replace(new RegExp('(\\n){2,}', 'ig'), '\n')
                .trim()
                .split('\n')
                .filter(y => (typeof y === "string" && y.length > 1))
                .map(x => {
                    const isModule = x.includes('{') && x.includes('}');
                    const xParts = x.replace('import', '')
                        .replace('{', '')
                        .replace('}', '')
                        .replace(';', '')
                        .trim()
                        .split('from');
                    return {
                        name: xParts[0] ? xParts[0].trim() : null,
                        type: isModule ? 'module' : 'common',
                        ref: xParts[1] ? xParts[1].replace(new RegExp('[\'\"]', 'ig'), '').trim() : null
                    }
                });
            const singleImports = results.filter(x => x.name.split(',').length === 1);
            const multipleImports = results.filter(x => x.name.split(',').length > 1);
            multipleImports.forEach(mImport => {
                singleImports.push(...mImport.name.split(',').map(y => {
                    return {
                        name: y.trim(),
                        type: mImport.type,
                        ref: mImport.ref
                    }
                }))
            });
            return singleImports;
        } else {
            return [];
        }
    }

    /**
     *
     * @param imports {Array<{name: string, ref: string, type: string}>}
     * @return {string}
     * @private
     */
    _getExternalLibImports(imports) {
        let im = '';
        for (const imp of imports) {
            if (imp.type === 'common') {
                im += `import ${imp.name} from '${imp.ref}';\n`
            } else {
                im += `import {${imp.name}} from '${imp.ref}';\n`
            }
        }

        return im;
    }
}
