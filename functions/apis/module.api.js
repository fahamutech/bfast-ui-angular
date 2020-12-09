const {StorageUtil} = require("../utils/storage.util");
const {ModulePage} = require("../pages/module.page");
const {ModuleService} = require("../services/module.service");
const {bfast} = require('bfastnode');

const storageUtil = new StorageUtil();

exports.moduleHome = bfast.functions().onGetHttpRequest('/project/:projectName/module',
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

exports.moduleHomeUpdateMainModule = bfast.functions().onPostHttpRequest('/project/:projectName/module',
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

exports.moduleCreate = bfast.functions().onGetHttpRequest('/project/:projectName/module/create',
    (request, response) => {

        const projectName = request.params.projectName;
        const projectPath = storageUtil.getConfig(`${projectName}:projectPath`);
        const _moduleService = new ModuleService(projectPath, projectName);
        const modulePage = new ModulePage(_moduleService);

        response.send(modulePage.create(request.query.error, request.params.projectName));
    }
);

exports.moduleCreatePost = bfast.functions().onPostHttpRequest(
    '/project/:projectName/module/create',
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
                response.redirect('/module');
            }).catch(reason => {
                response.status(400)
                    .redirect(`/project/${request.params.projectName}/module/create?error=` + reason.toString());
            });
        }
    ]
);

exports.moduleResourcesView = bfast.functions().onGetHttpRequest(
    '/project/:projectName/module/view/:module',
    (request, response) => {
        const projectName = request.params.projectName;
        const projectPath = storageUtil.getConfig(`${projectName}:projectPath`);
        const _moduleService = new ModuleService(projectPath, projectName);
        const modulePage = new ModulePage(_moduleService);
        modulePage.viewModuleResources(request.params.module, projectName).then(value => {
            response.send(value);
        }).catch(reason => {
            response.redirect(`/project/${projectName}/module?error=${reason.toString()}`);
        });
    }
);
