import bfastnode from 'bfastnode';
import {ModuleService} from "../services/module.service.mjs";
import {StorageUtil} from "../utils/storage.util.mjs";
import {AppUtil} from "../utils/app.util.mjs";

const {bfast} = bfastnode;
const storage = new StorageUtil();
const appUtil = new AppUtil();
const moduleService = new ModuleService(storage, appUtil);

export const mainModuleSync = bfast.functions().onEvent(
    '/sync',
    (request, response) => {
        const topic = request.body.project ? request.body.project + '_sync' : 'sync';
        const project = request.body.project;
        const module = request.body.module;
        const type = request.body.type;
        response.topic(topic).join();
        if (type && type === 'main') {
            moduleService.mainModuleFileToJson(project).then(value => {
                return moduleService.mainModuleJsonToFile(project, value);
            }).then(value => {
                response.topic(topic).announce(value);
            }).catch(reason => {
                response.topic(topic).announce(reason);
            });
        } else if (type && type === 'child' && module && typeof module === 'string') {
            moduleService.moduleFileToJson(project, module).then(value => {
                return moduleService.moduleJsonToFile(project, module, value);
            }).then(value => {
                response.topic(topic).announce(value);
            }).catch(reason => {
                response.topic(topic).announce(reason);
            });
        }
    }
);
