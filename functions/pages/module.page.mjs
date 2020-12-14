import {appLayoutComponent} from "../components/app-layout.component.mjs";
import {moduleAvailablesComponent} from "../components/module-availables.component.mjs";
import {moduleCreateComponent} from "../components/module-create.component.mjs";
import {moduleViewResources} from "../components/module-view-resources.component.mjs";


export class ModulePage {

    /**
     *
     * @param moduleService - {ModuleService}
     */
    constructor(moduleService) {
        this.moduleService = moduleService;
    }

    /**
     *
     * @param error - {string}
     * @param projectName - {string}
     * @returns {Promise<*>}
     */
    async index(projectName, error) {
        try {
            const value = await this.moduleService.getModules();
            value.mainModuleContents = await this.moduleService.getMainModuleContents()
            return appLayoutComponent(
                moduleAvailablesComponent(error, value.modules, value.name, value.mainModuleContents),
                projectName
            );
        } catch (reason) {
            return appLayoutComponent(moduleAvailablesComponent(reason.toString(), []), projectName);
        }
    }

    /**
     *
     * @param error - {string}
     * @param projectName - {string}
     * @returns {*}
     */
    create(error, projectName) {
        return appLayoutComponent(moduleCreateComponent(error, projectName), projectName);
    }

    async viewModuleResources(moduleName, projectName) {
        const contents = await this.moduleService.getOtherModuleContents(moduleName);
        return appLayoutComponent(moduleViewResources(null, moduleName, projectName, contents), projectName)
    }
}
