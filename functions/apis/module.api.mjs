import bfastnode from 'bfastnode';
import {StorageUtil} from "../utils/storage.util.mjs";
import {ModuleService} from "../services/module.service.mjs";
import {ModulePage} from "../pages/module.page.mjs";
import {ServicesService} from "../services/services.service.mjs";

const storageUtil = new StorageUtil();
const _moduleService = new ModuleService(storageUtil);
const servicesService = new ServicesService(storageUtil);

export const moduleHome = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules',
    (request, response) => {
        const project = request.params.project;
        const modulePage = new ModulePage(_moduleService, servicesService);
        modulePage.indexPage(project, request.query.error).then(value => {
            response.send(value);
        }).catch(reason => {
            response.status(400).send(reason);
        });
    }
);

export const moduleHomeUpdateMainModule = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules',
    (request, response) => {
        const project = request.params.project;
        const _moduleService = new ModuleService(storageUtil);
        _moduleService.updateMainModuleContents(project, request.body.code).then(_ => {
            response.json({message: 'done update'});
        }).catch(reason => {
            response.status(400).json({message: reason.toString()});
        });
    }
);

export const moduleCreate = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/create',
    (request, response) => {

        const project = request.params.project;
        const _moduleService = new ModuleService(storageUtil);
        const modulePage = new ModulePage(_moduleService, servicesService);

        response.send(modulePage.create(request.query.error, request.params.project));
    }
);

export const moduleCreatePost = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/create',
    [
        (request, response, next) => {
            request.body = JSON.parse(JSON.stringify(request.body));
            if (!request.body) {
                request.body = {};
            }
            next();
        },
        (request, response) => {

            const project = request.params.project;
            const _moduleService = new ModuleService(storageUtil);

            _moduleService.createModule(project, request.body.name, request.body.detail).then(_ => {
                response.redirect(`/project/${request.params.project}/modules/`);
            }).catch(reason => {
                response.status(400)
                    .redirect(`/project/${request.params.project}/modules/create?error=` + reason.toString());
            });
        }
    ]
);

export const moduleResourcesView = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources',
    (request, response) => {
        const project = request.params.project;
        const _moduleService = new ModuleService(storageUtil);
        const modulePage = new ModulePage(_moduleService, servicesService);
        modulePage.viewModuleResources(request.params.module, project).then(value => {
            response.send(value);
        }).catch(reason => {
            response.redirect(`/project/${project}/modules?error=${reason.toString()}`);
        });
    }
);

export const addInjectionToModuleSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/injections/:injection',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const injection = request.params.injection;
        _moduleService.moduleFileToJson(project, module).then(async value => {
            if (value && value.injections && Array.isArray(value.injections)) {
                const exist = value.injections.filter(x => x.service.toString().toLowerCase()
                    === injection.toString().split('.')[0].toLowerCase());
                if (exist.length === 0) {
                    value.injections.push({
                        name: injection.toString().split('.')[0].toString().toLowerCase() + 'Service'.trim(),
                        service: injection.toString().split('.')[0].toString().toLowerCase().trim()
                    });
                    await _moduleService.moduleJsonToFile(project, module, value);
                }
            }
            response.redirect(`/project/${project}/modules/${module}/resources`);
        }).catch(reason => {
            response.redirect(`/project/${project}/modules/${module}/resources?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        });
    }
);

export const deleteInjectionInModuleSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/injections/:injection/delete',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const injection = request.params.injection;
        _moduleService.moduleFileToJson(project, module).then(async value => {
            if (value && value.injections && Array.isArray(value.injections)) {
                value.injections = value.injections.filter(x => x.service.toString().toLowerCase()
                    !== injection.toString().split('.')[0].toLowerCase());
                await _moduleService.moduleJsonToFile(project, module, value);
            }
            response.redirect(`/project/${project}/modules/${module}/resources`);
        }).catch(reason => {
            response.redirect(`/project/${project}/modules/${module}/resources?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        });
    }
);
