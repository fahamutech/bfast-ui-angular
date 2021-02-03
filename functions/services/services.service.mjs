import {readdir, readFile, writeFile} from 'fs';
import {join} from 'path';
import {promisify} from 'util';
import {AppUtil} from "../utils/app.util.mjs";

export class ServicesService {

    /**
     *
     * @param storageService {StorageUtil}
     */
    constructor(storageService) {
        this.storageService = storageService;
    }

    async getServices(project, module) {
        try {
            const projectPath = this.storageService.getConfig(`${project}:projectPath`);
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
        serviceJsonFile.injections = AppUtil.getInjectionsFromFile(serviceFile);
        serviceJsonFile.methods = AppUtil.getMethodsFromFile(serviceFile);
        return serviceJsonFile;
    }

    async getService(project, module, service) {
        return this.serviceFileToJson(service, project, module);
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
            .map(x => 'private readonly ' + x.name + ': ' + AppUtil.firstCaseUpper(x.service) + 'Service')
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

@Injectable({
    providedIn: 'any'
})
export class ${AppUtil.firstCaseUpper(service.name)}Service {
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
            const serviceName = AppUtil.firstCaseUpper(injection.service)
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

}
