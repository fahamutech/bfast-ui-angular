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
        const config = this.storageUtil.getConfig(project);
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
        this.storageUtil.removeConfig(project);
    }

    /**
     *
     * @param project - {{
     *     name: string,
     *     module: string,
     *     projectPath: string
     * }}
     * @return {Promise<void>}
     */
    async addProject(project) {
        return this.storageUtil.setConfig(project.name, project);
    }
}
