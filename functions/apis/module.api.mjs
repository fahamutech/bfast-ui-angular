import bfastnode from 'bfastnode';
import {StorageUtil} from "../utils/storage.util.mjs";
import {ModuleService} from "../services/module.service.mjs";
import {ModulePage} from "../pages/module.page.mjs";

const storageUtil = new StorageUtil();

export const moduleHome = bfastnode.bfast.functions().onGetHttpRequest('/project/:project/modules',
    (request, response) => {
        const project = request.params.project;
        const _moduleService = new ModuleService(storageUtil);
        const modulePage = new ModulePage(_moduleService);
        modulePage.indexPage(project, request.query.error).then(value => {
            response.send(value)
        }).catch(reason => {
            response.status(400).send(reason);
        });
    }
);

export const moduleHomeUpdateMainModule = bfastnode.bfast.functions().onPostHttpRequest('/project/:project/modules',
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

export const moduleCreate = bfastnode.bfast.functions().onGetHttpRequest('/project/:project/modules/create',
    (request, response) => {

        const project = request.params.project;
        const _moduleService = new ModuleService(storageUtil);
        const modulePage = new ModulePage(_moduleService);

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
        const modulePage = new ModulePage(_moduleService);
        modulePage.viewModuleResources(request.params.module, project).then(value => {
            response.send(value);
        }).catch(reason => {
            response.redirect(`/project/${project}/modules?error=${reason.toString()}`);
        });
    }
);
