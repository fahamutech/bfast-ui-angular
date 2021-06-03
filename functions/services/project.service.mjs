import {mkdir, readdir, stat} from 'fs';
import {join} from 'path';
import {promisify} from 'util';
import {homedir} from "os";
import {exec} from 'child_process';

export class ProjectService {

    _baseProjectsPath = join(homedir(), 'BFastProjects');

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

    async ensureBaseProjectFolder() {
        try {
            await promisify(stat)(this._baseProjectsPath);
        } catch (e) {
            await promisify(mkdir)(this._baseProjectsPath)
        }
    }

    /**
     * create bfast ui project
     * @param project {string}
     * @return {Promise<string>}
     */
    async createProject(project) {
        project = project.replace(new RegExp('[^\\w]', 'ig'), '').toLowerCase();
        await this.ensureBaseProjectFolder();
        const r = await promisify(exec)(`bfast ui create ${project}`, {
            cwd: this._baseProjectsPath
        });
        console.log(r.toString());
        return project;
    }
}
