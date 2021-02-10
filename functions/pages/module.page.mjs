import {appLayoutComponent} from "../components/app-layout.component.mjs";
import {mainModuleAvailablesComponent} from "../components/main-module-availables.component.mjs";
import {moduleCreateComponent} from "../components/module-create.component.mjs";
import {moduleViewResources} from "../components/module-view-resources.component.mjs";
import {ModuleService} from '../services/module.service.mjs'
import {moduleConstructorUpdateComponent} from "../components/module-constructor-update.component.mjs";
import {mainModuleConstructorUpdateComponent} from "../components/main-module-constructor-update.component.mjs";


export class ModulePage {

    /**
     *
     * @param moduleService {ModuleService}
     * @param servicesService {ServicesService}
     * @param componentService {ComponentService}
     * @param pageService {PageService}
     * @param guardsService {GuardsService}
     */
    constructor(moduleService, servicesService,
                componentService, pageService,
                guardsService) {
        this.moduleService = moduleService;
        this.servicesService = servicesService;
        this.componentService = componentService;
        this.pageServive = pageService;
        this.guardsService = guardsService;
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
            value.mainModuleContents = await this.moduleService.getMainModuleContents(project);
            const moduleObject = await this.moduleService.mainModuleFileToJson(project);
            return appLayoutComponent(
                await mainModuleAvailablesComponent(
                    error,
                    value.modules,
                    project,
                    value.name,
                    value.mainModuleContents !== '' ? value.mainModuleContents : null,
                    moduleObject.routes
                ),
                project
            );
        } catch (reason) {
            return appLayoutComponent(await mainModuleAvailablesComponent(reason.toString(), [], project, '', null), project);
        }
    }

    /**
     *
     * @param error - {string}
     * @param project - {string}
     * @returns {*}
     */
    async create(error, project) {
        return appLayoutComponent(moduleCreateComponent(error, project), project, null);
    }

    async viewModuleResources(moduleName, project) {
        const contents = await this.moduleService.getOtherModuleContents(project, moduleName);
        const module = await this.moduleService.getModules(project);
        const moduleObject = await this.moduleService.moduleFileToJson(project, moduleName);
        const services = await this.servicesService.getServices(project, moduleName);
        const components = await this.componentService.getComponents(project, moduleName);
        const pages = await this.pageServive.getPages(project, moduleName);
        const guards = await this.guardsService.getGuards(project, moduleName);
        return appLayoutComponent(
            await moduleViewResources(
                null, moduleName, project, contents, moduleObject.injections,
                services ? services : [],
                moduleObject.exports,
                components,
                moduleObject.imports,
                module.modules,
                moduleObject.routes,
                pages,
                guards
            ),
            project,
            moduleName
        )
    }

    async moduleConstructorUpdateView(project, module, error = null) {
        const moduleObject = await this.moduleService.moduleFileToJson(project, module);
        return appLayoutComponent(
            await moduleConstructorUpdateComponent(
                project,
                module,
                moduleObject.constructor,
                error
            ),
            project,
            module
        )
    }

    async mainModuleConstructorUpdateView(project, error = null) {
        const moduleObject = await this.moduleService.mainModuleFileToJson(project);
        return appLayoutComponent(
            await mainModuleConstructorUpdateComponent(
                project,
                moduleObject.constructor,
                error
            ),
            project,
            null
        )
    }
}
