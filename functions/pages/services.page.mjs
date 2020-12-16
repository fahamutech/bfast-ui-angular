import {appLayoutComponent} from "../components/app-layout.component.mjs";
import {serviceListComponent} from "../components/services-list.component.mjs";
import {serviceCreateComponent} from "../components/service-create.component.mjs";
import {serviceMethodCreateComponent} from "../components/service-method-create.component.mjs";

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
        try {
            if (serviceName) {
                serviceInJson = await this.servicesService.serviceFileToJson(serviceName, projectName, module);
            }
            return appLayoutComponent(serviceCreateComponent(projectName, module, serviceInJson, error), projectName);
        } catch (e) {
            return appLayoutComponent(serviceCreateComponent(projectName, module, serviceInJson,
                e && e.message ? e.message : e.toString()), projectName);
        }
    }

    async createMethodPage(project, module, service, method = {name: '', inputs: '', body: null}, error = null) {
        return appLayoutComponent(serviceMethodCreateComponent(project, module, service, method, error));
    }
}
