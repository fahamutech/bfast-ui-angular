import bfastnode from 'bfastnode';
import {StorageUtil} from "../utils/storage.util.mjs";
import {ModuleService} from "../services/module.service.mjs";
import {ModulePage} from "../pages/module.page.mjs";
import {ServicesService} from "../services/services.service.mjs";
import {ComponentService} from "../services/component.service.mjs";
import {AppUtil} from "../utils/app.util.mjs";
import {PageService} from "../services/page.service.mjs";
import {GuardsService} from "../services/guards.service.mjs";

const storageUtil = new StorageUtil();
const _moduleService = new ModuleService(storageUtil);
const servicesService = new ServicesService(storageUtil);
const componentService = new ComponentService(storageUtil);
const pageService = new PageService(storageUtil);
const guardsService = new GuardsService(storageUtil);

export const moduleHome = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules',
    (request, response) => {
        const project = request.params.project;
        const modulePage = new ModulePage(_moduleService, servicesService, componentService, pageService, guardsService);
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
        const modulePage = new ModulePage(_moduleService, servicesService, componentService, pageService, guardsService);
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
        const modulePage = new ModulePage(_moduleService, servicesService, componentService, pageService, guardsService);
        modulePage.viewModuleResources(request.params.module, project).then(value => {
            response.send(value);
        }).catch(reason => {
            console.log(reason);
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


export const addExportToModuleSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/exports/:component',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        _moduleService.moduleFileToJson(project, module).then(async value => {
            if (value && value.exports && Array.isArray(value.exports)) {
                const exist = value.exports.filter(x => x.toString().toLowerCase()
                    === AppUtil.kebalCaseToCamelCase(component.toString().split('.')[0]).toLowerCase());
                if (exist.length === 0) {
                    value.exports.push(AppUtil.kebalCaseToCamelCase(component.toString().split('.')[0]));
                    await _moduleService.moduleJsonToFile(project, module, value);
                }
            }
            response.redirect(`/project/${project}/modules/${module}/resources`);
        }).catch(reason => {
            response.redirect(`/project/${project}/modules/${module}/resources?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        });
    }
);

export const deleteExportInModuleSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/exports/:component/delete',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        _moduleService.moduleFileToJson(project, module).then(async value => {
            if (value && value.exports && Array.isArray(value.exports)) {
                value.exports = value.exports.filter(x => x.toString().toLowerCase()
                    !== component.toString().trim().toLowerCase());
                await _moduleService.moduleJsonToFile(project, module, value);
            }
            response.redirect(`/project/${project}/modules/${module}/resources`);
        }).catch(reason => {
            response.redirect(`/project/${project}/modules/${module}/resources?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        });
    }
);

export const addImportToModuleSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/imports',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const body = JSON.parse(JSON.stringify(request.body));
        if (body && body.name && body.ref) {
            _moduleService.moduleFileToJson(project, module).then(async value => {
                if (value && value.imports && Array.isArray(value.imports)) {
                    const exist = value.imports.filter(x => x.name.toString().toLowerCase()
                        === AppUtil.kebalCaseToCamelCase(body.name.toString().split('.')[0]).concat('Module').toLowerCase());
                    if (exist.length === 0) {
                        value.imports.push({
                            name: AppUtil.kebalCaseToCamelCase(body.name.toString().split('.')[0]).concat('Module'),
                            ref: body.ref.toString().replace('.ts', '')
                        });
                        await _moduleService.moduleJsonToFile(project, module, value);
                    }
                }
                response.redirect(`/project/${project}/modules/${module}/resources`);
            }).catch(reason => {
                response.redirect(`/project/${project}/modules/${module}/resources?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`);
            });
        } else {
            response.redirect(`/project/${project}/modules/${module}/resources?error=${encodeURIComponent('name and ref attribute in a body is required')})`);
        }
    }
);

export const deleteImportInModuleSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/imports/:name/delete',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const name = request.params.name;
        _moduleService.moduleFileToJson(project, module).then(async value => {
            if (value && value.imports && Array.isArray(value.imports)) {
                value.imports = value.imports.filter(x => x.name.toString().toLowerCase()
                    !== name.toString().trim().toLowerCase());
                await _moduleService.moduleJsonToFile(project, module, value);
            }
            response.redirect(`/project/${project}/modules/${module}/resources`);
        }).catch(reason => {
            response.redirect(`/project/${project}/modules/${module}/resources?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`);
        });
    }
);


export const addRouteToModuleSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/routes',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const body = JSON.parse(JSON.stringify(request.body));
        if (body && body.page && body.path) {
            if (!body.guards) {
                body.guards = [];
            }
            if (typeof body.guards === "string") {
                body.guards = [body.guards];
            }
            if (body.path.toString().startsWith('/')) {
                body.path = body.path.toString().substring(1);
            }
            _moduleService.moduleFileToJson(project, module).then(async value => {
                if (value && value.routes && Array.isArray(value.routes)) {
                    const exist = value.routes.filter(x => x.path.toString().toLowerCase()
                        === body.path.toString().toLowerCase());
                    if (exist.length === 0) {
                        value.routes.push({
                            path: body.path,
                            page: AppUtil.kebalCaseToCamelCase(body.page.toString().replace('.page.ts', '')),
                            guards: body.guards.map(x => AppUtil.kebalCaseToCamelCase(x.replace('.guard.ts', '')))
                        });
                        await _moduleService.moduleJsonToFile(project, module, value);
                    }
                }
                response.redirect(`/project/${project}/modules/${module}/resources`);
            }).catch(reason => {
                response.redirect(`/project/${project}/modules/${module}/resources?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`);
            });
        } else {
            response.redirect(`/project/${project}/modules/${module}/resources?error=${encodeURIComponent('name and ref attribute in a body is required')})`);
        }
    }
);

export const deleteRouteInModuleSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/routes/:route/delete',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        let route = decodeURIComponent(request.params.route);
        if (route === '-') {
            route = '';
        }
        _moduleService.moduleFileToJson(project, module).then(async value => {
            if (value && value.routes && Array.isArray(value.routes)) {
                value.routes = value.routes.filter(x => x.path.toString().toLowerCase()
                    !== route.toString().trim().toLowerCase());
                await _moduleService.moduleJsonToFile(project, module, value);
            }
            response.redirect(`/project/${project}/modules/${module}/resources`);
        }).catch(reason => {
            response.redirect(`/project/${project}/modules/${module}/resources?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`);
        });
    }
);
