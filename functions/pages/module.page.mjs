import {appLayoutComponent} from "../components/app-layout.component.mjs";
import {moduleAvailablesComponent} from "../components/module-availables.component.mjs";
import {moduleCreateComponent} from "../components/module-create.component.mjs";
import {moduleViewResources} from "../components/module-view-resources.component.mjs";
import {ModuleService} from '../services/module.service.mjs'


export class ModulePage {

    /**
     *
     * @param moduleService {ModuleService}
     * @param servicesService {ServicesService}
     * @param componentService {ComponentService}
     */
    constructor(moduleService, servicesService, componentService) {
        this.moduleService = moduleService;
        this.servicesService = servicesService;
        this.componentService = componentService;
    }

    /**
     *
     * @param error - {string}
     * @param project - {string}
     * @returns {Promise<*>}
     */
    async indexPage(project, error) {
        try {
            const value = await this.moduleService.getModules(project);
            value.mainModuleContents = await this.moduleService.getMainModuleContents(project)
            return appLayoutComponent(
                moduleAvailablesComponent(error, value.modules, project, value.name, value.mainModuleContents !== '' ? value.mainModuleContents : null),
                project
            );
        } catch (reason) {
            return appLayoutComponent(moduleAvailablesComponent(reason.toString(), [], project, '', null), project);
        }
    }

    /**
     *
     * @param error - {string}
     * @param project - {string}
     * @returns {*}
     */
    create(error, project) {
        return appLayoutComponent(moduleCreateComponent(error, project), project);
    }

    async viewModuleResources(moduleName, project) {
        const contents = await this.moduleService.getOtherModuleContents(project, moduleName);
        const moduleObject = await this.moduleService.moduleFileToJson(project, moduleName);
        const services = await this.servicesService.getServices(project, moduleName);
        const components = await this.componentService.getComponents(project, moduleName);
        return appLayoutComponent(
            await moduleViewResources(
                null, moduleName, project, contents, moduleObject.injections,
                services ? services : [],
                moduleObject.exports,
                components
            ),
            project
        )
    }
}
