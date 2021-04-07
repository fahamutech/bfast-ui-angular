import bfastnode from 'bfastnode';
import {ModuleService} from "../services/module.service.mjs";
import {StorageUtil} from "../utils/storage.util.mjs";
import {AppUtil} from "../utils/app.util.mjs";
import {ComponentService} from "../services/component.service.mjs";
import {PageService} from "../services/page.service.mjs";
import {ServicesService} from "../services/services.service.mjs";
import {StylesService} from "../services/styles.service.mjs";
import {StateService} from "../services/state.service.mjs";
import {GuardsService} from "../services/guards.service.mjs";
import {ModelsService} from "../services/models.service.mjs";

const {bfast} = bfastnode;
const storageUtil = new StorageUtil();
const appUtil = new AppUtil();
const componentService = new ComponentService(storageUtil, appUtil);
const pageService = new PageService(storageUtil, appUtil);
const servicesService = new ServicesService(storageUtil, appUtil);
const styleService = new StylesService(storageUtil, appUtil);
const stateService = new StateService(storageUtil, appUtil);
const guardsService = new GuardsService(storageUtil, appUtil);
const modelsService = new ModelsService(storageUtil, appUtil);
const moduleService = new ModuleService(
    storageUtil,
    componentService,
    pageService,
    servicesService,
    guardsService,
    styleService,
    stateService,
    modelsService,
    appUtil
);

export const mainModuleSync = bfast.functions().onGuard(
    '/project/:project/modules',
    (request, response, next) => {
        const project = request.params.project;
        moduleService.mainModuleFileToJson(project).then(value => {
            return moduleService.mainModuleJsonToFile(project, value);
        }).catch(reason => {
            console.log(reason)
        }).finally(() => {
            next();
        });
    }
);

export const childModuleUpdateMiddleWare = bfast.functions().onGuard(
    '/project/:project/modules/:module/resources',
    (request, response, next) => {
        const project = request.params.project;
        const module = request.params.module;
        moduleService.moduleFileToJson(project, module).then(value => {
            return moduleService.moduleJsonToFile(project, module, value);
        }).catch(reason => {
            console.log(reason);
        }).finally(() => {
            next();
        });
    }
)
