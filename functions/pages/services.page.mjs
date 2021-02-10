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
     * @param project - {string}
     * @param module - {string}
     * @param error - {string}
     * @return {Promise<string>}
     */
    async indexPage(project, module, error = null) {
        try {
            const services = await this.servicesService.getServices(project, module)
            return appLayoutComponent(await serviceListComponent(project, module, services, error), project, module);
        } catch (e) {
            return appLayoutComponent(await serviceListComponent(project, module, [],
                e && e.message ? e.message : e.toString()), project, module);
        }
    }

    async viewServicePage(project, module, serviceName = null, error = null) {
        let serviceInJson = {name: ''};
        let services = [];
        try {
            if (serviceName) {
                if (!serviceName.toString().includes('.service.ts')) {
                    serviceName += '.service.ts';
                }
                serviceInJson = await this.servicesService.serviceFileToJson(serviceName, project, module);
                services = await this.servicesService.getServices(project, module);
                services = services.filter(x => x.toString() !== serviceName);
            }
            return appLayoutComponent(await serviceCreateComponent(project, module, serviceInJson, services, error), project, module);
        } catch (e) {
            return appLayoutComponent(await serviceCreateComponent(project, module, serviceInJson, services,
                e && e.message ? e.message : e.toString()), project, module);
        }
    }

    async createMethodPage(project, module, service, method = {name: '', inputs: '', body: null}, error = null) {
        return appLayoutComponent(serviceMethodCreateComponent(project, module, service, method, error), project, module);
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
        const methodMap = await this.servicesService.getMethod(project, module, service, method);
        return appLayoutComponent(serviceMethodUpdateComponent(project, module, service, methodMap, error), project, module);
    }
}
