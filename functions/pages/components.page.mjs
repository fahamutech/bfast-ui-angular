import {appLayoutComponent} from "../components/app-layout.component.mjs";
import {componentListComponent} from "../components/components-list.component.mjs";
import {componentCreateComponent} from "../components/component-create.component.mjs";
import {componentMethodCreateComponent} from "../components/component-method-create.component.mjs";
import {componentMethodUpdateComponent} from "../components/component-method-update.component.mjs";
import {componentTemplateUpdateComponent} from "../components/component-template-update.component.mjs";

export class ComponentsPage {

    /**
     *
     * @param componentsService {ComponentService}
     */
    constructor(componentsService) {
        this.componentsService = componentsService
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
            const components = await this.componentsService.getComponents(project, module)
            return appLayoutComponent(await componentListComponent(project, module, components, error), project, module);
        } catch (e) {
            return appLayoutComponent(await componentListComponent(project, module, [],
                e && e.message ? e.message : e.toString()), project, module);
        }
    }

    async viewComponentPage(project, module, componentName = null, error = null) {
        let componentInJson = {name: ''};
        let states = [];
        let styles = [];
        try {
            if (componentName) {
                if (!componentName.toString().includes('.component.ts')) {
                    componentName += '.component.ts';
                }
                componentInJson = await this.componentsService.componentFileToJson(project, module, componentName);
                states = await this.componentsService.getStates(project, module);
                styles = await this.componentsService.getStyles(project, module);
            }
            return appLayoutComponent(await componentCreateComponent(project, module, componentInJson, states, styles, error), project, module);
        } catch (e) {
            return appLayoutComponent(
                await componentCreateComponent(project, module, componentInJson, states, styles,
                    e && e.message ? e.message : e.toString()),
                project,
                module
            );
        }
    }

    async createMethodPage(project, module, component, method = {name: '', inputs: '', body: null}, error = null) {
        return appLayoutComponent(
            componentMethodCreateComponent(project, module, component, method, error),
            project,
            module
        );
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param component - {string}
     * @param method - {string}
     * @param error - {string}
     * @return {Promise<string>}
     */
    async updateMethodPage(project, module, component, method, error = null) {
        const methodMap = await this.componentsService.getMethod(project, module, component, method);
        return appLayoutComponent(
            componentMethodUpdateComponent(project, module, component, methodMap, error),
            project,
            module
        );
    }

    async updateTemplatePage(project, module, selectedComponent, error) {
        const template = await this.componentsService.getTemplate(project, module, selectedComponent);
        return appLayoutComponent(
            componentTemplateUpdateComponent(project, module, selectedComponent, template, error),
            project,
            module
        );
    }
}
