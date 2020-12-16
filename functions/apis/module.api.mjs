import bfastnode from 'bfastnode';
import {StorageUtil} from "../utils/storage.util.mjs";
import {ModuleService} from "../services/module.service.mjs";
import {ModulePage} from "../pages/module.page.mjs";

const storageUtil = new StorageUtil();

export const moduleHome = bfastnode.bfast.functions().onGetHttpRequest('/project/:projectName/modules',
    (request, response) => {

        const projectName = request.params.projectName;
        const projectPath = storageUtil.getConfig(`${projectName}:projectPath`);
        const _moduleService = new ModuleService(projectPath, projectName);
        const modulePage = new ModulePage(_moduleService);

        modulePage.index(request.params.projectName, request.query.error).then(value => {
            response.send(value)
        }).catch(reason => {
            response.status(400).send(reason);
        });
    }
);

export const moduleHomeUpdateMainModule = bfastnode.bfast.functions().onPostHttpRequest('/project/:projectName/modules',
    (request, response) => {
        const projectName = request.params.projectName;
        const projectPath = storageUtil.getConfig(`${projectName}:projectPath`);
        const _moduleService = new ModuleService(projectPath, projectName);
        _moduleService.updateMainModuleContents(request.body.code).then(_ => {
            response.json({message: 'done update'});
        }).catch(reason => {
            response.status(400).json({message: reason.toString()});
        });
    }
);

export const moduleCreate = bfastnode.bfast.functions().onGetHttpRequest('/project/:projectName/modules/create',
    (request, response) => {

        const projectName = request.params.projectName;
        const projectPath = storageUtil.getConfig(`${projectName}:projectPath`);
        const _moduleService = new ModuleService(projectPath, projectName);
        const modulePage = new ModulePage(_moduleService);

        response.send(modulePage.create(request.query.error, request.params.projectName));
    }
);

export const moduleCreatePost = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:projectName/modules/create',
    [
        (request, response, next) => {
            request.body = JSON.parse(JSON.stringify(request.body));
            if (!request.body) {
                request.body = {};
            }
            next();
        },
        (request, response) => {

            const projectName = request.params.projectName;
            const projectPath = storageUtil.getConfig(`${projectName}:projectPath`);
            const _moduleService = new ModuleService(projectPath, projectName);

            _moduleService.createModule(request.body.name, request.body.detail).then(_ => {
                response.redirect(`/project/${request.params.projectName}/modules/`);
            }).catch(reason => {
                response.status(400)
                    .redirect(`/project/${request.params.projectName}/modules/create?error=` + reason.toString());
            });
        }
    ]
);

export const moduleResourcesView = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:projectName/modules/:module/resources',
    (request, response) => {
        const projectName = request.params.projectName;
        const projectPath = storageUtil.getConfig(`${projectName}:projectPath`);
        const _moduleService = new ModuleService(projectPath, projectName);
        const modulePage = new ModulePage(_moduleService);
        modulePage.viewModuleResources(request.params.module, projectName).then(value => {
            response.send(value);
        }).catch(reason => {
            response.redirect(`/project/${projectName}/modules?error=${reason.toString()}`);
        });
    }
);
