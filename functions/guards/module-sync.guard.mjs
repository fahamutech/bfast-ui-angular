import bfastnode from 'bfastnode';
import {ModuleService} from "../services/module.service.mjs";
import {StorageUtil} from "../utils/storage.util.mjs";
import {AppUtil} from "../utils/app.util.mjs";

const {bfast} = bfastnode;
const storage = new StorageUtil();
const appUtil = new AppUtil();
const moduleService = new ModuleService(storage, appUtil);

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
