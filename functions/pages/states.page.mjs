import {appLayoutComponent} from "../components/app-layout.component.mjs";
import {stateListComponent} from "../components/states-list.component.mjs";
import {stateCreateComponent} from "../components/state-create.component.mjs";
import {stateMethodCreateComponent} from "../components/state-method-create.component.mjs";
import {stateMethodUpdateComponent} from "../components/state-method-update.component.mjs";

export class StatesPage {

    /**
     *
     * @param statesService {StateService}
     */
    constructor(statesService) {
        this.statesService = statesService
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
            const states = await this.statesService.getStates(project, module)
            return appLayoutComponent(await stateListComponent(project, module, states, error), project, module);
        } catch (e) {
            return appLayoutComponent(await stateListComponent(project, module, [],
                e && e.message ? e.message : e.toString()), project, module);
        }
    }

    async viewStatePage(project, module, stateName = null, error = null) {
        let stateInJson = {name: ''};
        let services = [];
        try {
            if (stateName) {
                if (!stateName.toString().includes('.state.ts')) {
                    stateName += '.state.ts';
                }
                stateInJson = await this.statesService.stateFileToJson(stateName, project, module);
                services = await this.statesService.getServices(project, module);
                // services = services.filter(x => x.toString() !== stateName);
            }
            return appLayoutComponent(await stateCreateComponent(project, module, stateInJson, services, error), project, module);
        } catch (e) {
            return appLayoutComponent(await stateCreateComponent(project, module, stateInJson, services,
                e && e.message ? e.message : e.toString()), project, module);
        }
    }

    async createMethodPage(project, module, state, method = {name: '', inputs: '', body: null}, error = null) {
        return appLayoutComponent(stateMethodCreateComponent(project, module, state, method, error), project, module);
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param state - {string}
     * @param method - {string}
     * @param error - {string}
     * @return {Promise<string>}
     */
    async updateMethodPage(project, module, state, method, error = null) {
        const methodMap = await this.statesService.getMethod(project, module, state, method);
        return appLayoutComponent(stateMethodUpdateComponent(project, module, state, methodMap, error), project, module);
    }
}
