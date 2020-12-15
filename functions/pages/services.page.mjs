import {appLayoutComponent} from "../components/app-layout.component.mjs";
import {serviceListComponent} from "../components/services-list.component.mjs";
import {serviceCreateComponent} from "../components/service-create.component.mjs";

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
            return appLayoutComponent(serviceListComponent(projectName, module, services, error), projectName);
        } catch (e) {
            return appLayoutComponent(serviceListComponent([],
                e && e.message ? e.message : e.toString()), projectName);
        }
    }

    async createPage(projectName, module, serviceName = null, error = null) {
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

    // async updatePage(projectName, module, serviceName, error = null) {
    //     try {
    //         const serviceInJson = await this.servicesService.serviceFileToJson(serviceName, projectName, module);
    //         return appLayoutComponent(serviceUpdateComponent(projectName, module, serviceInJson, error), projectName);
    //     } catch (e) {
    //         return appLayoutComponent(serviceUpdateComponent(projectName, module, {name: ''},
    //             e && e.message ? e.message : e.toString()), projectName);
    //     }
    // }
}
