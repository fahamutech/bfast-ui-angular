import bfastnode from 'bfastnode'
import {StorageUtil} from "../utils/storage.util.mjs";
import {GuardsService} from "../services/guards.service.mjs";
import {GuardsPage} from "../pages/guards.page.mjs";

const guardsService = new GuardsService(new StorageUtil());
const guardsPage = new GuardsPage(guardsService);

export const viewModuleGuards = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/guards',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        guardsPage.indexPage(project, module).then(value => {
            response.send(value);
        }).catch(_ => {
            response.status(400).send(_);
        });
    }
);

export const createModuleGuards = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/guards',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const body = JSON.parse(JSON.stringify(request.body));

        function _guardsPage(error = null) {
            guardsPage.indexPage(project, module, error).then(value => {
                response.send(value);
            }).catch(_ => {
                response.status(400).send(_);
            });
        }

        if (body && body.name && body.name !== '') {
            const guardName = body.name.toString().trim().toLowerCase();
            guardsService.createGuard(project, module, guardName).then(_ => {
                _guardsPage();
            }).catch(reason => {
                _guardsPage(reason && reason.message ? reason.message : reason.toString());
            });
        } else {
            _guardsPage("Please enter valid guard name");
        }
    }
);

export const viewModuleGuard = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/guards/:guard',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const selectedGuard = request.params.guard;
        if (selectedGuard) {
            guardsPage.viewGuardPage(project, module, selectedGuard, request.query.error).then(value => {
                response.send(value);
            }).catch(_ => {
                response.status(400).send(_);
            });
        } else {
            guardsPage.viewGuardPage(project, module).then(value => {
                response.send(value);
            }).catch(_ => {
                response.status(400).send(_);
            });
        }
    }
);


export const updateModuleGuard = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/guards/:guard',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const body = JSON.parse(JSON.stringify(request.body));
        console.log(body)
        if (body && body.name && body.name !== '' && body.body !== undefined && body.body !== null) {
            body.name = body.name.toString().trim().toLowerCase();
            guardsService.updateGuard(project, module, body).then(_ => {
                response.send({message: 'done update guard'})
            }).catch(reason => {
                response.status(400).send(reason.toString());
            });
        } else {
            response.status(400).send("Please enter valid guard name and body");
        }
    }
);
