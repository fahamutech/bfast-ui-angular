import bfastnode from 'bfastnode';
import {StorageUtil} from "../utils/storage.util.mjs";
import {ModuleService} from "../services/module.service.mjs";
import {ModulePage} from "../pages/module.page.mjs";
import {ServicesService} from "../services/services.service.mjs";
import {ComponentService} from "../services/component.service.mjs";
import {AppUtil} from "../utils/app.util.mjs";
import {PageService} from "../services/page.service.mjs";
import {GuardsService} from "../services/guards.service.mjs";

const {bfast} = bfastnode;
bfast.init({
    functionsURL: `http://localhost:${process.env.DEV_PORT ? process.env.DEV_PORT : process.env.PORT}`,
    databaseURL: `http://localhost:${process.env.DEV_PORT ? process.env.DEV_PORT : process.env.PORT}`,
});
const syncEvent = bfast.functions().event(`/sync`);

const storageUtil = new StorageUtil();
const appUtil = new AppUtil();
const _moduleService = new ModuleService(storageUtil, appUtil);
const servicesService = new ServicesService(storageUtil, appUtil);
const componentService = new ComponentService(storageUtil, appUtil);
const pageService = new PageService(storageUtil, appUtil);
const guardsService = new GuardsService(storageUtil, appUtil);
const modulePage = new ModulePage(_moduleService, servicesService, componentService, pageService, guardsService);

export const moduleHome = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules',
    (request, response) => {
        const project = request.params.project;
        const modulePage = new ModulePage(_moduleService, servicesService, componentService, pageService, guardsService);
        modulePage.indexPage(project, request.query.error).then(value => {
            response.send(value);
        }).catch(reason => {
            response.status(400).send(reason);
        }).finally(() => {
            syncEvent.emit({body: {project: project, type: 'main'}});
        });
    }
);

export const moduleHomeUpdateMainModule = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules',
    (request, response) => {
        const project = request.params.project;
        // _moduleService.updateMainModuleContents(project, request.body.code).then(_ => {
        response.json({message: 'done update'});
        //  syncEvent.emit({body: {project: project, type: 'main'}});
        // }).catch(reason => {
        //     response.status(400).json({message: reason.toString()});
        // });
    }
);

export const addImportToMainModuleSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/imports',
    (request, response) => {
        const project = request.params.project;
        const body = JSON.parse(JSON.stringify(request.body));
        if (body && body.name && body.ref) {
            _moduleService.mainModuleFileToJson(project).then(async value => {
                if (value && value.imports && Array.isArray(value.imports)) {
                    const exist = value.imports.filter(x => x.name.toString().toLowerCase()
                        === appUtil.kebalCaseToCamelCase(body.name.toString().split('.')[0]).concat('Module').toLowerCase());
                    if (exist.length === 0) {
                        value.imports.push({
                            name: appUtil.kebalCaseToCamelCase(body.name.toString().split('.')[0]).concat('Module'),
                            ref: body.ref.toString().replace('.ts', '')
                        });
                        await _moduleService.mainModuleJsonToFile(project, value);
                    }
                }
                response.redirect(`/project/${project}/modules`);
            }).catch(reason => {
                response.redirect(`/project/${project}/modules?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`);
            });
        } else {
            response.redirect(`/project/${project}/modules?error=${encodeURIComponent('name and ref attribute in a body is required')})`);
        }
    }
);

export const deleteImportInMainModuleSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/imports/:name/delete',
    (request, response) => {
        const project = request.params.project;
        const name = request.params.name;
        _moduleService.mainModuleFileToJson(project).then(async value => {
            if (value && value.imports && Array.isArray(value.imports)) {
                value.imports = value.imports.filter(x => x.name.toString().toLowerCase()
                    !== name.toString().trim().toLowerCase());
                await _moduleService.mainModuleJsonToFile(project, value);
            }
            response.redirect(`/project/${project}/modules`);
        }).catch(reason => {
            response.redirect(`/project/${project}/modules?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`);
        });
    }
);

export const mainModuleConstructorUpdate = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/main/constructor',
    (request, response) => {
        const project = request.params.project;
        const error = decodeURIComponent(request.query.error);
        modulePage.mainModuleConstructorUpdateView(project).then(value => {
            response.send(value);
        }).catch(reason => {
            console.log(reason);
            response.status(400).redirect(`/project/${project}/modules/main/constructor?error=${reason.toString()}`);
        });
    }
);


export const mainModuleConstructorUpdateSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/main/constructor',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const body = JSON.parse(JSON.stringify(request.body));
        if (body && body.body) {
            _moduleService.mainModuleFileToJson(project).then(async value => {
                value.constructor = body.body
                return _moduleService.mainModuleJsonToFile(project, value);
            }).then(_ => {
                // response.redirect(`/project/${project}/modules/${module}/resources`);
                response.json({message: 'Constructor Updated, Successful'});
            }).catch(reason => {
                console.log(reason);
                response.status(400).json({message: reason && reason.message ? reason.message : reason.toString()});
            });
        } else {
            response.status(400).json({message: 'Please provide constructor body to update'});
        }
    }
);

export const addRouteToMainModuleSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/routes',
    (request, response) => {
        const project = request.params.project;
        const body = JSON.parse(JSON.stringify(request.body));
        if (body && body.module && body.path) {
            if (!body.guards) {
                body.guards = [];
            }
            if (typeof body.guards === "string") {
                body.guards = [body.guards];
            }
            if (body.path.toString().startsWith('/')) {
                body.path = body.path.toString().substring(1);
            }
            if (!body.ref || body.ref === '') {
                const _m = appUtil.camelCaseToKebal(body.module);
                body.ref = `./modules/${_m}/${_m}.module`;
            }
            _moduleService.mainModuleFileToJson(project).then(async value => {
                if (value && value.routes && Array.isArray(value.routes)) {
                    const exist = value.routes.filter(x => x.path.toString().toLowerCase()
                        === body.path.toString().toLowerCase());
                    if (exist.length === 0) {
                        value.routes.push({
                            path: body.path,
                            ref: body.ref,
                            module: appUtil.kebalCaseToCamelCase(body.module.toString().replace('.module.ts', '')),
                            guards: body.guards.map(x => appUtil.kebalCaseToCamelCase(x.replace('.guard.ts', '')))
                        });
                        await _moduleService.mainModuleJsonToFile(project, value);
                    }
                }
                response.redirect(`/project/${project}/modules`);
            }).catch(reason => {
                console.log(reason);
                response.redirect(`/project/${project}/modules?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`);
            });
        } else {
            response.redirect(`/project/${project}/modules?error=${encodeURIComponent('name and ref attribute in a body is required')})`);
        }
    }
);

export const deleteRouteInMainModuleSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/routes/:route/delete',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        let route = decodeURIComponent(request.params.route);
        if (route === '-') {
            route = '';
        }
        _moduleService.mainModuleFileToJson(project).then(async value => {
            if (value && value.routes && Array.isArray(value.routes)) {
                value.routes = value.routes.filter(x => x.path.toString().toLowerCase()
                    !== route.toString().trim().toLowerCase());
                await _moduleService.mainModuleJsonToFile(project, value);
            }
            response.redirect(`/project/${project}/modules`);
        }).catch(reason => {
            response.status(400).redirect(`/project/${project}/modules?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`);
        });
    }
);

export const moduleCreate = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/create',
    (request, response) => {
        const project = request.params.project;
        // const modulePage = new ModulePage(_moduleService, servicesService, componentService, pageService, guardsService);
        modulePage.create(null, project).then(value => {
            response.send(value);
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules`);
        });
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
            _moduleService.createModule(project, request.body.name, request.body.detail).then(_ => {
                response.redirect(`/project/${request.params.project}/modules/`);
            }).catch(reason => {
                console.log(reason)
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
        const module = request.params.module;
        const modulePage = new ModulePage(_moduleService, servicesService, componentService, pageService, guardsService);
        modulePage.viewModuleResources(request.params.module, project).then(value => {
            response.send(value);
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules?error=${reason.toString()}`);
        }).finally(() => {
            syncEvent.emit({body: {project: project, module: module, type: 'child'}});
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
                    === appUtil.kebalCaseToCamelCase(component.toString().split('.')[0]).toLowerCase());
                if (exist.length === 0) {
                    value.exports.push(appUtil.kebalCaseToCamelCase(component.toString().split('.')[0]));
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
                        === appUtil.kebalCaseToCamelCase(body.name.toString().split('.')[0]).concat('Module').toLowerCase());
                    if (exist.length === 0) {
                        value.imports.push({
                            name: appUtil.kebalCaseToCamelCase(body.name.toString().split('.')[0]).concat('Module'),
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
                            page: appUtil.kebalCaseToCamelCase(body.page.toString().replace('.page.ts', '')),
                            guards: body.guards.map(x => appUtil.kebalCaseToCamelCase(x.replace('.guard.ts', '')))
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
            response.status(400).redirect(`/project/${project}/modules/${module}/resources?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`);
        });
    }
);

export const moduleConstructorUpdate = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/constructor',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const error = decodeURIComponent(request.query.error);
        const modulePage = new ModulePage(_moduleService, servicesService, componentService, pageService, guardsService);
        modulePage.moduleConstructorUpdateView(project, module).then(value => {
            response.send(value);
        }).catch(reason => {
            console.log(reason);
            response.status(400).redirect(`/project/${project}/modules/${module}/resources/constructor?error=${reason.toString()}`);
        });
    }
);

export const moduleConstructorUpdateSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/constructor',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const body = JSON.parse(JSON.stringify(request.body));
        if (body && body.body) {
            _moduleService.moduleFileToJson(project, module).then(async value => {
                value.constructor = body.body
                return _moduleService.moduleJsonToFile(project, module, value);
            }).then(_ => {
                // response.redirect(`/project/${project}/modules/${module}/resources`);
                response.json({message: 'Constructor Updated, Successful'});
            }).catch(reason => {
                response.status(400).json({message: reason && reason.message ? reason.message : reason.toString()});
            });
        } else {
            response.status(400).json({message: 'Please provide constructor body to update'});
        }
    }
);
