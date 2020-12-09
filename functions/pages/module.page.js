const {moduleViewResources} = require("../components/module-view-resources.component");
const {moduleCreateComponent} = require("../components/module-create.component");
const {appLayoutComponent} = require("../components/app-layout.component");
const {moduleAvailablesComponent} = require("../components/module-availables.component");

class ModulePage {

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
            console.log(value);
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

module.exports = {
    ModulePage: ModulePage
}
