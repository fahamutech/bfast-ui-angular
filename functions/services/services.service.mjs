import {readdir} from 'fs';
import {join} from 'path';
import {promisify} from 'util';

export class ServicesService {

    /**
     *
     * @param storageService {StorageUtil}
     */
    constructor(storageService) {
        this.storageService = storageService;
    }

    async getServices(projectName, moduleName) {
        const projectPath = this.storageService.getConfig(`${projectName}:projectPath`);
        const servicesDir = join(projectPath, 'modules', moduleName, 'services');
        return promisify(readdir)(servicesDir);
    }

    /**
     *
     * @param project - {string} current project
     * @param module - {string} current module
     * @return {Promise<void>}
     */
    async serviceFileToJson(project, module) {
        const projectPath = this.storageService.getConfig(`${project}:projectPath`);
    }
}
