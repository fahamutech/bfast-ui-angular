import {appLayoutComponent} from "../components/app-layout.component.mjs";
import {serviceListComponent} from "../components/services-list.component.mjs";
import {serviceCreateComponent} from "../components/service-create.component.mjs";
import {styleListComponent} from "../components/styles-list.component.mjs";

export class StylesPage {

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
            return appLayoutComponent(await styleListComponent(project, module, services, error), project);
        } catch (e) {
            return appLayoutComponent(await styleListComponent(project, module, [],
                e && e.message ? e.message : e.toString()), project);
        }
    }

    async viewStylePage(project, module, style = null, error = null) {
        let serviceInJson = {name: ''};
        let styles = [];
        try {
            if (style) {
                if (!style.toString().includes('.style.scss')) {
                    style += '.style.scss';
                }
                serviceInJson = await this.servicesService.serviceFileToJson(style, project, module);
                styles = await this.servicesService.getServices(project, module);
                styles = styles.filter(x => x.toString() !== style);
            }
            return appLayoutComponent(await serviceCreateComponent(project, module, serviceInJson, styles, error), project);
        } catch (e) {
            return appLayoutComponent(await serviceCreateComponent(project, module, serviceInJson, styles,
                e && e.message ? e.message : e.toString()), project);
        }
    }

    // async createMethodPage(project, module, service, method = {name: '', inputs: '', body: null}, error = null) {
    //     return appLayoutComponent(serviceMethodCreateComponent(project, module, service, method, error));
    // }
    //
    // /**
    //  *
    //  * @param project - {string}
    //  * @param module - {string}
    //  * @param service - {string}
    //  * @param method - {string}
    //  * @param error - {string}
    //  * @return {Promise<string>}
    //  */
    // async updateMethodPage(project, module, service, method, error = null) {
    //     const methodMap = await this.servicesService.getMethod(project, module, service, method);
    //     return appLayoutComponent(serviceMethodUpdateComponent(project, module, service, methodMap, error));
    // }
}
