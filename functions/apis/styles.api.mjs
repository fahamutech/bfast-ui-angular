import bfastnode from 'bfastnode'
import {StorageUtil} from "../utils/storage.util.mjs";
import {StylesPage} from "../pages/styles.page.mjs";
import {StylesService} from "../services/styles.service.mjs";

const stylesService = new StylesService(new StorageUtil());
const stylesPage = new StylesPage(stylesService);

export const viewModuleStyles = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/styles',
    (request, response) => {
        const stylesService = new StylesService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        new StylesPage(stylesService).indexPage(project, module).then(value => {
            response.send(value);
        }).catch(_ => {
            response.status(400).send(_);
        });
    }
);

export const createModuleStyles = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/styles',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const body = JSON.parse(JSON.stringify(request.body));

        function stylePage(error = null) {
            stylesPage.indexPage(project, module, error).then(value => {
                response.send(value);
            }).catch(_ => {
                response.status(400).send(_);
            });
        }

        if (body && body.name && body.name !== '') {
            const styleName = body.name.toString().trim().toLowerCase();
            stylesService.createStyle(project, module, styleName).then(_ => {
                stylePage();
            }).catch(reason => {
                stylePage(reason && reason.message ? reason.message : reason.toString());
            });
        } else {
            stylePage("Please enter valid style name");
        }
    }
);

export const viewModuleStyle = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/styles/:style',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const selectedStyle = request.params.style;
        if (selectedStyle) {
            stylesPage.viewStylePage(project, module, selectedStyle, request.query.error).then(value => {
                response.send(value);
            }).catch(_ => {
                response.status(400).send(_);
            });
        } else {
            stylesPage.viewStylePage(project, module).then(value => {
                response.send(value);
            }).catch(_ => {
                response.status(400).send(_);
            });
        }
    }
);


export const updateModuleStyle = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/styles/:style',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const body = JSON.parse(JSON.stringify(request.body));
        if (body && body.name && body.name !== '' && body.body !== undefined && body.body !== null) {
            body.name = body.name.toString().trim().toLowerCase();
            stylesService.updateStyle(project, module, body).then(_ => {
                response.send({message: 'done update style'})
            }).catch(reason => {
                response.status(400).send(reason.toString());
            });
        } else {
            response.status(400).send("Please enter valid style name and body");
        }
    }
);
