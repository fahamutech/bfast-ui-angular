import {readdir, stat} from 'fs';
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
    async getProjects(project) {
        const config = await this.storageUtil.getConfig(project);
        const projects = [];
        Object.keys(config).forEach(key => {
            projects.push({
                name: config[key]['name'],
                module: config[key]['module'],
                projectPath: config[key]['projectPath']
            });
        });
        return projects;
    }

    async deleteProject(project) {
        return this.storageUtil.removeConfig(project);
    }

    /**
     *
     * @param project  {{
     *     name: string,
     *     module: string,
     *     projectPath: string
     * }}
     * @return {Promise<*>}
     */
    async addProject(project) {
        await promisify(stat)(join(project.projectPath, project.module.trim() + '.module.ts'));
        const modules = await promisify(readdir)(join(project.projectPath, 'modules'));
        if (modules && Array.isArray(modules)) {
            return this.storageUtil.setConfig(project.name, project);
        } else {
            throw 'Folder structure is unknown';
        }
    }

    async ensureProjectFolder() {
        // const projectsPath = join(homedir(), 'BFastProjects1');
        // try{
        //     const r = await promisify(stat)(projectsPath);
        //     console.log(r);
        // }catch (e){
        //     await promisify(mkdir)(projectsPath)
        // }
    }

    /**
     * create bfast ui project
     * @param project {string}
     * @return {Promise<*>}
     */
    async createProject(project) {

    }
}
