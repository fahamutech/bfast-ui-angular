import {appLayoutComponent} from "../components/app-layout.component.mjs";
import {guardListComponent} from "../components/guards-list.component.mjs";
import {guardCreateComponent} from "../components/guard-create.component.mjs";

export class GuardsPage {

    /**
     *
     * @param guardsService
     */
    constructor(guardsService) {
        this.guardsService = guardsService
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
            return appLayoutComponent(await guardListComponent(project, module, guards, error), project);
        } catch (e) {
            return appLayoutComponent(await guardListComponent(project, module, [],
                e && e.message ? e.message : e.toString()), project);
        }
    }

    async viewGuardPage(project, module, guard = null, error = null) {
        let guardFileInJson = {name: '', body: ''};
        let guards = [];
        try {
            if (guard) {
                if (!guard.toString().includes('.style.scss')) {
                    guard += '.style.scss';
                }
                guardFileInJson = await this.guardsService.guardFileToJson(project, module, guard);
                console.log(guardFileInJson);
                guards = await this.guardsService.getGuards(project, module);
                guards = guards.filter(x => x.toString() !== guard);
            }
            return appLayoutComponent(await guardCreateComponent(project, module, guardFileInJson, guards, error), project);
        } catch (e) {
            return appLayoutComponent(await guardCreateComponent(project, module, guardFileInJson, guards,
                e && e.message ? e.message : e.toString()), project);
        }
    }
}
