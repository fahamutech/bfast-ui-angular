import bfastnode from 'bfastnode'
import {StorageUtil} from "../utils/storage.util.mjs";
import {GuardsService} from "../services/guards.service.mjs";
import {GuardsPage} from "../pages/guards.page.mjs";
import {ServicesService} from "../services/services.service.mjs";

const guardsService = new GuardsService(new StorageUtil());
const servicesService = new ServicesService(new StorageUtil());
const guardsPage = new GuardsPage(guardsService, servicesService);

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

export const updateModuleGuardView = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/guards/:guard/method/:method',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const guard = request.params.guard;
        guardsPage.updateGuardPage(project, module, guard).then(value => {
            response.send(value);
        }).catch(reason => {
            response.status(400).send(reason);
        });
    }
);

export const updateModuleGuard = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/guards/:guard/method/:method',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const guard = request.params.guard;
        const body = JSON.parse(JSON.stringify(request.body));
        console.log(body);
        if (body && body.name && body.name !== '' && body.body !== undefined && body.body !== null) {
            body.name = body.name.toString().trim().toLowerCase();
            guardsService.updateGuard(project, module, body).then(_ => {
                response.redirect(`/project/${project}/modules/${module}/resources/guards/${guard}/method/canActivate`);
            }).catch(reason => {
                console.log(reason);
                response.redirect(`/project/${project}/modules/${module}/resources/guards/${guard}/method/canActivate?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())}`);
            });
        } else {
            response.status(400).send("Please enter valid guard name and body");
        }
    }
);


export const addInjectionInAGuardSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/guards/:guard/injections/:injection',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const guard = request.params.guard;
        const injection = request.params.injection;
        guardsService.getGuard(project, module, guard).then(async value => {
            if (value && value.injections && Array.isArray(value.injections)) {
                const exist = value.injections.filter(x => x.service.toString().toLowerCase()
                    === injection.toString().split('.')[0].toLowerCase());
                if (exist.length === 0) {
                    value.injections.push({
                        name: injection.toString().split('.')[0].toString().toLowerCase() + 'Service'.trim(),
                        service: injection.toString().split('.')[0].toString().toLowerCase().trim()
                    });
                    await guardsService.jsonToGuardFile(project, module, value);
                }
            }
            response.redirect(`/project/${project}/modules/${module}/resources/guards/${guard}`)
        }).catch(reason => {
            response.redirect(`/project/${project}/modules/${module}/resources/guards/${guard}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        });
    }
);

export const deleteInjectionInAGuardSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/guards/:guard/injections/:injection/delete',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const guard = request.params.guard;
        const injection = request.params.injection;
        guardsService.getGuard(project, module, guard).then(async value => {
            if (value && value.injections && Array.isArray(value.injections)) {
                value.injections = value.injections.filter(x => x.service.toString().toLowerCase()
                    !== injection.toString().split('.')[0].toLowerCase());
                await guardsService.jsonToGuardFile(project, module, value);
            }
            response.redirect(`/project/${project}/modules/${module}/resources/guards/${guard}`);
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/guards/${guard}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        });
    }
);
