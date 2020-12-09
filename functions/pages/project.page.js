const {projectListComponent} = require("../components/project-list.component");
const {moduleViewResources} = require("../components/module-view-resources.component");
const {moduleCreateComponent} = require("../components/module-create.component");
const {appLayoutComponent} = require("../components/app-layout.component");
const {moduleAvailablesComponent} = require("../components/module-availables.component");

class ProjectPage {

    /**
     *
     * @param projectService - {ProjectService}
     */
    constructor(projectService) {
        this.projectService = projectService;
    }

    /**
     *
     * @param error - {string}
     * @returns {Promise<*>}
     */
    async index(error) {
        try {
            const value = await this.projectService.getProjects();
            return appLayoutComponent(
                projectListComponent(value),
                null
            );
        } catch (reason) {
            return appLayoutComponent(projectListComponent());
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
    ProjectPage: ProjectPage
}
