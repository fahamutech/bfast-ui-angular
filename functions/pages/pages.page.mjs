import {appLayoutComponent} from "../components/app-layout.component.mjs";
import {pageListComponent} from "../components/pages-list.component.mjs";
import {pageCreateComponent} from "../components/page-create.component.mjs";
import {pageMethodCreateComponent} from "../components/page-method-create.component.mjs";
import {pageMethodUpdateComponent} from "../components/page-method-update.component.mjs";
import {pageTemplateUpdateComponent} from "../components/page-template-update.component.mjs";
import {StylesService} from "../services/styles.service.mjs";
import {StateService} from "../services/state.service.mjs";

export class PagesPage {

    /**
     *
     * @param pagesService {PageService}
     * @param styleService {StylesService}
     * @param stateService {StateService}
     */
    constructor(pagesService, styleService, stateService) {
        this.pagesService = pagesService
        this.stateService = stateService;
        this.styleService = styleService;
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
            const pages = await this.pagesService.getPages(project, module)
            return appLayoutComponent(await pageListComponent(project, module, pages, error), project, module);
        } catch (e) {
            return appLayoutComponent(await pageListComponent(project, module, [],
                e && e.message ? e.message : e.toString()), project, module);
        }
    }

    async viewPagePage(project, module, pageName = null, error = null) {
        let pageInJson = {name: ''};
        let states = [];
        let styles = [];
        try {
            if (pageName) {
                if (!pageName.toString().includes('.page.ts')) {
                    pageName += '.page.ts';
                }
                pageInJson = await this.pagesService.pageFileToJson(project, module, pageName);
                states = await this.stateService.getStates(project, module);
                styles = await this.styleService.getStyles(project, module);
            }
            return appLayoutComponent(await pageCreateComponent(project, module, pageInJson, states, styles, error), project, module);
        } catch (e) {
            return appLayoutComponent(await pageCreateComponent(project, module, pageInJson, states, styles,
                e && e.message ? e.message : e.toString()), project, module);
        }
    }

    async createMethodPage(project, module, page, method = {name: '', inputs: '', body: null}, error = null) {
        return appLayoutComponent(pageMethodCreateComponent(project, module, page, method, error), project, module);
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param page - {string}
     * @param method - {string}
     * @param error - {string}
     * @return {Promise<string>}
     */
    async updateMethodPage(project, module, page, method, error = null) {
        const methodMap = await this.pagesService.getMethod(project, module, page, method);
        return appLayoutComponent(pageMethodUpdateComponent(project, module, page, methodMap, error), project, module);
    }

    async updateTemplatePage(project, module, selectedComponent, error) {
        const template = await this.pagesService.getTemplate(project, module, selectedComponent);
        return appLayoutComponent(pageTemplateUpdateComponent(project, module, selectedComponent, template, error), project, module);
    }
}
