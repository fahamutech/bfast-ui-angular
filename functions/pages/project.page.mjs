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
                projectListComponent(value, error),
                null
            );
        } catch (reason) {
            return appLayoutComponent(projectListComponent([], error), null);
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
        return appLayoutComponent(moduleViewResources(null, moduleName, project, contents), project)
    }
}
