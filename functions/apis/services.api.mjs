import bfastnode from 'bfastnode'
import {ServicesPage} from "../pages/services.page.mjs";
import {ServicesService} from "../services/services.service.mjs";
import {StorageUtil} from "../utils/storage.util.mjs";

export const viewModuleServices = bfastnode.bfast.functions().onGetHttpRequest('/project/:projectId/module/view/:module/services',
    (request, response) => {

        const servicesService = new ServicesService(new StorageUtil());
        const projectId = request.params.projectId;
        const module = request.params.module;
        new ServicesPage(servicesService).indexPage(projectId, module).then(value => {
            response.send(value);
        }).catch(_ => {
            response.status(400).send(_);
        });
    }
);

export const createAModuleService = bfastnode.bfast.functions().onGetHttpRequest('/project/:projectId/module/view/:module/services/create',
    (request, response) => {
        const servicesService = new ServicesService(new StorageUtil());
        const projectId = request.params.projectId;
        const module = request.params.module;
        if (request.query.update) {
            new ServicesPage(servicesService).updatePage(projectId, module, request.query.update).then(value => {
                response.send(value);
            }).catch(_ => {
                response.status(400).send(_);
            });
        } else {
            new ServicesPage(servicesService).createPage(projectId, module).then(value => {
                response.send(value);
            }).catch(_ => {
                response.status(400).send(_);
            });
        }
    }
);

