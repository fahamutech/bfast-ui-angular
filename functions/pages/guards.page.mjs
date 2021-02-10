import {appLayoutComponent} from "../components/app-layout.component.mjs";
import {guardListComponent} from "../components/guards-list.component.mjs";
import {guardCreateComponent} from "../components/guard-create.component.mjs";
import {guardMethodUpdateComponent} from "../components/guard-method-update.component.mjs";

export class GuardsPage {

    /**
     *
     * @param guardsService
     * @param servicesService
     */
    constructor(guardsService, servicesService) {
        this.guardsService = guardsService;
        this.servicesService = servicesService;
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
            const guards = await this.guardsService.getGuards(project, module)
            return appLayoutComponent(await guardListComponent(project, module, guards, error), project, module);
        } catch (e) {
            return appLayoutComponent(await guardListComponent(project, module, [],
                e && e.message ? e.message : e.toString()), project, module);
        }
    }

    async viewGuardPage(project, module, guard = null, error = null) {
        let guardFileInJson = {name: '', body: '', injections: []};
        // let guards = [];
        let services = [];
        try {
            services = await this.servicesService.getServices(project, module);
            if (guard) {
                if (!guard.toString().includes('.guard.ts')) {
                    guard += '.guard.ts';
                }
                guardFileInJson = await this.guardsService.guardFileToJson(project, module, guard);
                // guards = await this.guardsService.getGuards(project, module);
                // guards = guards.filter(x => x.toString() !== guard);
                // console.log(guardFileInJson);
            }
            return appLayoutComponent(await guardCreateComponent(project, module, guardFileInJson, services, error), project, module);
        } catch (e) {
            console.log(e);
            return appLayoutComponent(await guardCreateComponent(project, module, guardFileInJson, services,
                e && e.message ? e.message : e.toString()), project, module);
        }
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param guard - {string}
     * @param error - {string}
     * @return {Promise<string>}
     */
    async updateGuardPage(project, module, guard, error = null) {
        try {
            const guardInJson = await this.guardsService.guardFileToJson(project, module, guard)
            return appLayoutComponent(guardMethodUpdateComponent(project, module, guardInJson, error), project, module);
        } catch (e) {
            return appLayoutComponent(guardMethodUpdateComponent(project, module, null,
                e && e.message ? e.message : e.toString()), project, module);
        }
    }
}
