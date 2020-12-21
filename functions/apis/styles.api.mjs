import bfastnode from 'bfastnode'
import {ServicesPage} from "../pages/services.page.mjs";
import {ServicesService} from "../services/services.service.mjs";
import {StorageUtil} from "../utils/storage.util.mjs";
import {StylesPage} from "../pages/styles.page.mjs";

export const viewModuleStyles = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/styles',
    (request, response) => {
        const servicesService = new ServicesService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        new StylesPage(servicesService).indexPage(project, module).then(value => {
            response.send(value);
        }).catch(_ => {
            response.status(400).send(_);
        });
    }
);

export const createModuleStyles = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/styles',
    (request, response) => {
        const servicesService = new ServicesService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const body = JSON.parse(JSON.stringify(request.body));

        function servicePage(error = null) {
            new ServicesPage(servicesService).indexPage(project, module, error).then(value => {
                response.send(value);
            }).catch(_ => {
                response.status(400).send(_);
            });
        }

        if (body && body.name && body.name !== '') {
            const serviceName = body.name.toString().toLowerCase();
            servicesService.createService(project, module, serviceName).then(_ => {
                servicePage();
            }).catch(reason => {
                servicePage(reason && reason.message ? reason.message : reason.toString());
            });
        } else {
            servicePage("Please enter valid service name");
        }
    }
);

export const viewModuleStyle = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/styles/:style',
    (request, response) => {
        const servicesService = new ServicesService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const selectedService = request.params.service;
        if (selectedService) {
            new ServicesPage(servicesService).viewServicePage(project, module, selectedService, request.query.error).then(value => {
                response.send(value);
            }).catch(_ => {
                response.status(400).send(_);
            });
        } else {
            new ServicesPage(servicesService).viewServicePage(project, module,).then(value => {
                response.send(value);
            }).catch(_ => {
                response.status(400).send(_);
            });
        }
    }
);

