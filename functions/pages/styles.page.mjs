import {appLayoutComponent} from "../components/app-layout.component.mjs";
import {styleListComponent} from "../components/styles-list.component.mjs";
import {styleCreateComponent} from "../components/style-create.component.mjs";

export class StylesPage {

    /**
     *
     * @param stylesService
     */
    constructor(stylesService) {
        this.stylesService = stylesService
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
            const services = await this.stylesService.getStyles(project, module)
            return appLayoutComponent(await styleListComponent(project, module, services, error), project);
        } catch (e) {
            return appLayoutComponent(await styleListComponent(project, module, [],
                e && e.message ? e.message : e.toString()), project);
        }
    }

    async viewStylePage(project, module, style = null, error = null) {
        let styleFileInJson = {name: '', body: ''};
        let styles = [];
        try {
            if (style) {
                if (!style.toString().includes('.style.scss')) {
                    style += '.style.scss';
                }
                styleFileInJson = await this.stylesService.styleFileToJson(project, module, style);
                styles = await this.stylesService.getStyles(project, module);
                styles = styles.filter(x => x.toString() !== style);
            }
            return appLayoutComponent(await styleCreateComponent(project, module, styleFileInJson, styles, error), project);
        } catch (e) {
            return appLayoutComponent(await styleCreateComponent(project, module, styleFileInJson, styles,
                e && e.message ? e.message : e.toString()), project);
        }
    }
}
