import bfastnode from 'bfastnode'
import {ServicesPage} from "../pages/services.page.mjs";
import {ServicesService} from "../services/services.service.mjs";
import {StorageUtil} from "../utils/storage.util.mjs";
import {AppUtil} from "../utils/app.util.mjs";

const storage = new StorageUtil();
const appUtil = new AppUtil();
const servicesService = new ServicesService(storage, appUtil);
const servicesPage = new ServicesPage(servicesService);

export const viewModuleServices = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/services',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        servicesPage.indexPage(project, module).then(value => {
            response.send(value);
        }).catch(_ => {
            response.status(400).send(_);
        });
    }
);

export const createModuleServices = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/services',
    (request, response) => {

        const project = request.params.project;
        const module = request.params.module;
        const body = JSON.parse(JSON.stringify(request.body));

        function servicePage(error = null) {
            servicesPage.indexPage(project, module, error).then(value => {
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

export const viewModuleService = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/services/:service',
    (request, response) => {

        const project = request.params.project;
        const module = request.params.module;
        const selectedService = request.params.service;
        if (selectedService) {
            servicesPage.viewServicePage(project, module, selectedService, request.query.error).then(value => {
                response.send(value);
            }).catch(_ => {
                response.status(400).send(_);
            });
        } else {
            servicesPage.viewServicePage(project, module,).then(value => {
                response.send(value);
            }).catch(_ => {
                response.status(400).send(_);
            });
        }
    }
);

export const createMethodInAService = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/services/:service/method',
    (request, response) => {

        const project = request.params.project;
        const module = request.params.module;
        const service = request.params.service;
        servicesPage.createMethodPage(project, module, service, {
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

export const createMethodInAServiceSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/services/:service/method',
    (request, response) => {

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

export const updateMethodInAService = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/services/:service/method/:method',
    (request, response) => {

        const project = request.params.project;
        const module = request.params.module;
        const service = request.params.service;
        const method = request.params.method;
        return servicesPage.updateMethodPage(project, module, service, method).then(value => {
            response.send(value);
        }).catch(reason => {
            response.status(400).redirect(
                `/project/${project}/modules/${module}/resources/services/${service}?error=${encodeURIComponent(reason && reason.message ? reason.message : '')}`
            );
        });
    }
);

export const updateMethodInAServiceSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/services/:service/method/:method',
    (request, response) => {

        const project = request.params.project;
        const module = request.params.module;
        const service = request.params.service;
        const method = request.params.method;
        const body = JSON.parse(JSON.stringify(request.body));
        servicesService.updateMethod(project, module, service, method, {
            name: body.name,
            inputs: body.inputs,
            return: 'any',
            body: body.codes
        }).then(_ => {
            response.redirect(`/project/${project}/modules/${module}/resources/services/${service}`);
        }).catch(reason => {
            response.redirect(`/project/${project}/modules/${module}/resources/services/${service}/method/${method}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())}&codes=${encodeURIComponent(body.codes)}&name=${encodeURIComponent(body.name)}&inputs=${encodeURIComponent(body.inputs)}`);
        });
    }
);

export const deleteMethodInAServiceSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/services/:service/method/:method/delete',
    (request, response) => {

        const project = request.params.project;
        const module = request.params.module;
        const service = request.params.service;
        const method = request.params.method;
        //  const body = JSON.parse(JSON.stringify(request.body));
        servicesService.deleteMethod(project, module, service, method).then(_ => {
            response.redirect(`/project/${project}/modules/${module}/resources/services/${service}`);
        }).catch(reason => {
            response.redirect(`/project/${project}/modules/${module}/resources/services/${service}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())}`);
        });
    }
);

export const addInjectionInAServiceSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/services/:service/injections/:injection',
    (request, response) => {

        const project = request.params.project;
        const module = request.params.module;
        const service = request.params.service;
        const injection = request.params.injection;
        servicesService.serviceFileToJson(project, module, service).then(async value => {
            if (value && value.injections && Array.isArray(value.injections)) {
                const exist = value.injections.filter(x => x.service.toString().toLowerCase()
                    === injection.toString().split('.')[0].toLowerCase());
                if (exist.length === 0) {
                    value.injections.push({
                        name: injection.toString().split('.')[0].toString().toLowerCase() + 'Service'.trim(),
                        service: injection.toString().split('.')[0].toString().toLowerCase().trim()
                    });
                    await servicesService.jsonToServiceFile(project, module, value)
                }
            }
            response.redirect(`/project/${project}/modules/${module}/resources/services/${service}`)
        }).catch(reason => {
            response.redirect(`/project/${project}/modules/${module}/resources/services/${service}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        });
    }
);

export const deleteInjectionInAServiceSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/services/:service/injections/:injection/delete',
    (request, response) => {

        const project = request.params.project;
        const module = request.params.module;
        const service = request.params.service;
        const injection = request.params.injection;
        servicesService.serviceFileToJson(project, module, service).then(async value => {
            if (value && value.injections && Array.isArray(value.injections)) {
                value.injections = value.injections.filter(x => x.service.toString().toLowerCase()
                    !== injection.toString().split('.')[0].toLowerCase());
                await servicesService.jsonToServiceFile(project, module, value)
            }
            response.redirect(`/project/${project}/modules/${module}/resources/services/${service}`)
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/services/${service}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        });
    }
);


export const addImportToServiceSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/services/:service/imports',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const service = request.params.service;
        const body = JSON.parse(JSON.stringify(request.body));
        if (body && body.name && body.ref && body.type) {
            servicesService.serviceFileToJson(project, module, service).then(async value => {
                if (value && value.imports && Array.isArray(value.imports)) {
                    const exist = value.imports.filter(
                        x => x.name.toString().toLowerCase() === body.name.toString().toLowerCase()
                    );
                    if (exist.length === 0) {
                        value.imports.push({
                            name: body.name.toString(),
                            type: body.type,
                            ref: body.ref.toString(),
                        });
                        await servicesService.jsonToServiceFile(project, module, value);
                    }
                }
                response.redirect(`/project/${project}/modules/${module}/resources/services/${service}`);
            }).catch(reason => {
                console.log(reason);
                response.redirect(`/project/${project}/modules/${module}/resources/services/${service}s?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`);
            });
        } else {
            response.redirect(`/project/${project}/modules/${module}/resources/services/${service}?error=${encodeURIComponent('name and ref attribute in a body is required')})`);
        }
    }
);

export const deleteImportInServiceSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/services/:service/imports/:name/delete',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const service = request.params.service;
        const name = decodeURIComponent(request.params.name);
        servicesService.serviceFileToJson(project, module, service).then(async value => {
            if (value && value.imports && Array.isArray(value.imports)) {
                value.imports = value.imports.filter(x => x.name.toString().toLowerCase()
                    !== name.toString().trim().toLowerCase());
                await servicesService.jsonToServiceFile(project, module, value);
            }
            response.redirect(`/project/${project}/modules/${module}/resources/services/${service}`);
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/services/${service}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`);
        });
    }
);

