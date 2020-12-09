const {readdir, mkdir, writeFile, readFile} = require('fs');
const {join} = require('path');
const {promisify} = require('util')

class ProjectService {

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

module.exports = {
    ProjectService: ProjectService
}
