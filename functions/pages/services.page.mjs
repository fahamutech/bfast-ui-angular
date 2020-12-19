import {appLayoutComponent} from "../components/app-layout.component.mjs";
import {serviceListComponent} from "../components/services-list.component.mjs";
import {serviceCreateComponent} from "../components/service-create.component.mjs";
import {serviceMethodCreateComponent} from "../components/service-method-create.component.mjs";
import {serviceMethodUpdateComponent} from "../components/service-method-update.component.mjs";

export class ServicesPage {

    /**
     *
     * @param servicesService - {ServicesService}
     */
    constructor(servicesService) {
        this.servicesService = servicesService
    }

    /**
     *
     * @param projectName - {string}
     * @param module - {string}
     * @param error - {string}
     * @return {Promise<string>}
     */
    async indexPage(projectName, module, error = null) {
        try {
            const services = await this.servicesService.getServices(projectName, module)
            return appLayoutComponent(await serviceListComponent(projectName, module, services, error), projectName);
        } catch (e) {
            return appLayoutComponent(await serviceListComponent(projectName, module, [],
                e && e.message ? e.message : e.toString()), projectName);
        }
    }

    async viewServicePage(projectName, module, serviceName = null, error = null) {
        let serviceInJson = {name: ''};
        let services = [];
        try {
            if (serviceName) {
                if (!serviceName.toString().includes('.service.ts')) {
                    serviceName += '.service.ts';
                }
                serviceInJson = await this.servicesService.serviceFileToJson(serviceName, projectName, module);
                services = await this.servicesService.getServices(projectName, module);
                services = services.filter(x => x.toString() !== serviceName);
                console.log(serviceName)
                console.log(services);
            }
            return appLayoutComponent(await serviceCreateComponent(projectName, module, serviceInJson, services, error), projectName);
        } catch (e) {
            return appLayoutComponent(await serviceCreateComponent(projectName, module, serviceInJson, services,
                e && e.message ? e.message : e.toString()), projectName);
        }
    }

    async createMethodPage(project, module, service, method = {name: '', inputs: '', body: null}, error = null) {
        return appLayoutComponent(serviceMethodCreateComponent(project, module, service, method, error));
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param service - {string}
     * @param method - {string}
     * @param error - {string}
     * @return {Promise<string>}
     */
    async updateMethodPage(project, module, service, method, error = null) {
        // try {
        const methodMap = await this.servicesService.getMethod(project, module, service, method);
        return appLayoutComponent(serviceMethodUpdateComponent(project, module, service, methodMap, error));
        // } catch (e) {
        //     return this.viewServicePage(project, module, service, error);
        // }
    }
}
