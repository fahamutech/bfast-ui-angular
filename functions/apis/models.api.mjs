import bfastnode from 'bfastnode'
import {StorageUtil} from "../utils/storage.util.mjs";
import {ModelsService} from "../services/models.service.mjs";
import {ModelsPage} from "../pages/models.page.mjs";
import {AppUtil} from "../utils/app.util.mjs";

const appUtil = new AppUtil();
const modelsService = new ModelsService(new StorageUtil(), appUtil);
const modelsPage = new ModelsPage(modelsService);

export const viewModuleModels = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/models',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        modelsPage.indexPage(project, module).then(value => {
            response.send(value);
        }).catch(_ => {
            response.status(400).send(_);
        });
    }
);

export const createModuleModels = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/models',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const body = JSON.parse(JSON.stringify(request.body));

        function _modelsPage(error = null) {
            modelsPage.indexPage(project, module, error).then(value => {
                response.send(value);
            }).catch(_ => {
                response.status(400).send(_);
            });
        }

        if (body && body.name && body.name !== '') {
            const modelName = body.name.toString().trim().toLowerCase();
            modelsService.createModel(project, module, modelName).then(_ => {
                _modelsPage();
            }).catch(reason => {
                _modelsPage(reason && reason.message ? reason.message : reason.toString());
            });
        } else {
            _modelsPage("Please enter valid model name");
        }
    }
);

export const viewModuleModel = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/models/:model',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const selectedStyle = request.params.model;
        if (selectedStyle) {
            modelsPage.viewModelPage(project, module, selectedStyle, request.query.error).then(value => {
                response.send(value);
            }).catch(_ => {
                response.status(400).send(_);
            });
        } else {
            modelsPage.viewModelPage(project, module).then(value => {
                response.send(value);
            }).catch(_ => {
                response.status(400).send(_);
            });
        }
    }
);


export const updateModuleModel = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/models/:model',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const body = JSON.parse(JSON.stringify(request.body));
        if (body && body.name && body.name !== '' && body.body !== undefined && body.body !== null) {
            body.name = body.name.toString().trim().toLowerCase();
            modelsService.updateModel(project, module, body).then(_ => {
                response.send({message: 'done update model'})
            }).catch(reason => {
                response.status(400).send(reason.toString());
            });
        } else {
            response.status(400).send("Please enter valid model name and body");
        }
    }
);
