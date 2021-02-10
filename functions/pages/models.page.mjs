import {appLayoutComponent} from "../components/app-layout.component.mjs";
import {modelListComponent} from "../components/models-list.component.mjs";
import {modelCreateComponent} from "../components/model-create.component.mjs";

export class ModelsPage {

    /**
     *
     * @param modelsService
     */
    constructor(modelsService) {
        this.modelsService = modelsService
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
            const models = await this.modelsService.getModels(project, module)
            return appLayoutComponent(await modelListComponent(project, module, models, error), project, module);
        } catch (e) {
            return appLayoutComponent(await modelListComponent(project, module, [],
                e && e.message ? e.message : e.toString()), project, module);
        }
    }

    async viewModelPage(project, module, model = null, error = null) {
        let modelFileInJson = {name: '', body: ''};
        let models = [];
        try {
            if (model) {
                if (!model.toString().includes('.style.scss')) {
                    model += '.style.scss';
                }
                modelFileInJson = await this.modelsService.modelFileToJson(project, module, model);
                models = await this.modelsService.getModels(project, module);
                models = models.filter(x => x.toString() !== model);
            }
            return appLayoutComponent(await modelCreateComponent(project, module, modelFileInJson, models, error), project, module);
        } catch (e) {
            return appLayoutComponent(await modelCreateComponent(project, module, modelFileInJson, models,
                e && e.message ? e.message : e.toString()), project, module);
        }
    }
}
