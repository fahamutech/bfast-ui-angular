import {appLayoutComponent} from "../components/app-layout.component.mjs";
import {projectListComponent} from "../components/project-list.component.mjs";
import {moduleCreateComponent} from "../components/module-create.component.mjs";
import {moduleViewResources} from "../components/module-view-resources.component.mjs";

export class ProjectPage {

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
    async indexPage(error) {
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
