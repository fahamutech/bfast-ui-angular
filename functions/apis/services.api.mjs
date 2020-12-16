import bfastnode from 'bfastnode'
import {ServicesPage} from "../pages/services.page.mjs";
import {ServicesService} from "../services/services.service.mjs";
import {StorageUtil} from "../utils/storage.util.mjs";

export const viewModuleServices = bfastnode.bfast.functions().onGetHttpRequest('/project/:project/modules/:module/resources/services',
    (request, response) => {
        const servicesService = new ServicesService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        new ServicesPage(servicesService).indexPage(project, module).then(value => {
            response.send(value);
        }).catch(_ => {
            response.status(400).send(_);
        });
    }
);

export const createModuleServices = bfastnode.bfast.functions().onPostHttpRequest('/project/:project/modules/:module/resources/services',
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

export const viewModuleService = bfastnode.bfast.functions().onGetHttpRequest('/project/:project/modules/:module/resources/services/:service',
    (request, response) => {
        const servicesService = new ServicesService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const selectedService = request.params.service;
        if (selectedService) {
            new ServicesPage(servicesService).viewServicePage(project, module, selectedService).then(value => {
                response.send(value);
            }).catch(_ => {
                response.status(400).send(_);
            });
        } else {
            new ServicesPage(servicesService).viewServicePage(project, module).then(value => {
                response.send(value);
            }).catch(_ => {
                response.status(400).send(_);
            });
        }
    }
);

export const createMethodInAService = bfastnode.bfast.functions().onGetHttpRequest('/project/:project/modules/:module/resources/services/:service/method',
    (request, response) => {
        const servicesService = new ServicesService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const service = request.params.service;
        new ServicesPage(servicesService).createMethodPage(project, module, service, {
            name: request.query.name ? request.query.name : '',
            inputs: request.query.inputs ? request.query.inputs : '',
            body: request.query.codes,
            return: 'any'
        }, request.query.error).then(value => {
            response.send(value);
        }).catch(reason => {
            response.status(400).send(reason);
        });
    }
);

export const createMethodInAServiceSubmit = bfastnode.bfast.functions().onPostHttpRequest('/project/:project/modules/:module/resources/services/:service/method',
    (request, response) => {
        const servicesService = new ServicesService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const service = request.params.service;
        const body = JSON.parse(JSON.stringify(request.body));
        servicesService.addMethod(project, module, service, {
            name: body.name,
            inputs: body.inputs,
            return: 'any',
            body: body.codes
        }).then(_ => {
            response.redirect(`/project/${project}/modules/${module}/resources/services/${service}`);
        }).catch(reason => {
            response.redirect(`/project/${project}/modules/${module}/resources/services/${service}/method?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())}&codes=${encodeURIComponent(body.codes)}&name=${encodeURIComponent(body.name)}&inputs=${encodeURIComponent(body.inputs)}`);
        });
    }
);

