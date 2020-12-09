const {bfast} = require('bfastnode');
const {ModuleUi} = require('../ui/module.ui');
const {AppUi} = require('../ui/app.ui');
const {ModuleController} = require('../controllers/module.controller');

const appUi = new AppUi();
const moduleUi = new ModuleUi();
const moduleController = new ModuleController('/home/josh/WebstormProjects/UdictiHub/src/app', 'udicti');

exports.moduleHome = bfast.functions().onGetHttpRequest('/module',
    (request, response) => {
        moduleController.getModules().then(async value => {
            return {
                modules: value.modules,
                name: value.name,
                mainModuleContents: await moduleController.getMainModuleContents()
            }
        }).then(value => {
            response.send(
                appUi.main(
                    moduleUi.availableModule(null, value.modules, value.name, value.mainModuleContents)
                )
            );
        }).catch(reason => {
            response.send(appUi.main(moduleUi.availableModule(reason.toString(), [])));
        })
    }
);

exports.moduleHomeUpdateMainModule = bfast.functions().onPostHttpRequest('/module',
    (request, response) => {
        moduleController.updateMainModuleContents(request.body.code).then(value => {
            response.json({message: 'done update'});
        }).catch(reason => {
            response.status(400).json({message: reason.toString()});
        });
    }
);

exports.moduleCreate = bfast.functions().onGetHttpRequest('/module/create',
    (request, response) => {
        response.send(appUi.main(moduleUi.createModule(request.query.error)));
    }
);

exports.moduleCreatePost = bfast.functions().onPostHttpRequest(
    '/module/create',
    [
        (request, response, next) => {
            request.body = JSON.parse(JSON.stringify(request.body));
            if (!request.body) {
                request.body = {};
            }
            next();
        },
        (request, response) => {
            moduleController.createModule(request.body.name, request.body.detail).then(_ => {
                console.log(_)
                response.redirect('/module');
            }).catch(reason => {
                response.status(400).redirect('/module/create?error=' + reason.toString())
            });
        }
    ]
);

exports.moduleView = bfast.functions().onGetHttpRequest(
    '/module/view/:module',
    (request, response) => {
        // moduleController.
    }
);
