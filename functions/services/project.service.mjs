import {readdir, mkdir, writeFile, readFile} from 'fs';
import {join} from 'path';
import {promisify} from 'util';

export class ProjectService {

    /**
     *
     * @param storageUtil - {StorageUtil}
     */
    constructor(storageUtil) {
        this.storageUtil = storageUtil;
    }

    /**
     *
     * @returns {Promise<Array<{projectPath: string, name: string}>>}
     */
    async getProjects(projectName) {
        const config = this.storageUtil.getConfig(projectName);
        const projects = [];
        Object.keys(config).forEach(key => {
            projects.push({name: key, projectPath: config[key]['projectPath']});
        });
        return projects;
    }
}
