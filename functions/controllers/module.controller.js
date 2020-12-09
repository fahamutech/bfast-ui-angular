const {readdir, mkdir, writeFile, readFile} = require('fs');
const {join} = require('path');
const {promisify} = require('util')

class ModuleController {

    /**
     * @param projectPath - {string} root project path
     * @param projectName - {string} root project name
     */
    constructor(projectPath, projectName) {
        this.projectPath = projectPath;
        this.projectName = projectName;
    }

    /**
     *
     * @returns {Promise<{modules: Array<string>, name: string}>}
     */
    async getModules() {
        if (this.projectPath) {
            const modules = await promisify(readdir)(join(this.projectPath, 'modules'));
            return {
                name: this.projectName,
                modules: modules
            }
        } else {
            throw Error("Path to project required");
        }
    }

    /**
     * get main module contents
     * @returns {Promise<string>}
     */
    async getMainModuleContents() {
        if (this.projectPath && this.projectName) {
            const fileBuffer = await promisify(readFile)(join(this.projectPath, `${this.projectName}.module.ts`));
            return fileBuffer.toString('utf-8');
        } else {
            throw Error("Main module not found");
        }
    }

    /**
     *
     * @param contents - {string}
     * @returns {Promise<unknown>}
     */
    async updateMainModuleContents(contents) {
        if (contents) {
            return await promisify(writeFile)(join(this.projectPath, `${this.projectName}.module.ts`), contents);
        } else {
            throw Error("module contents required");
        }
    }

    /**
     *
     * @param name - {string}
     * @param detail - {string}
     * @returns {Promise<void>}
     */
    async createModule(name, detail) {
        if (this.projectPath) {
            if (name && name !== '') {
                return promisify(mkdir)(join(this.projectPath, 'modules', name));
            } else {
                throw Error("Module name required")
            }
        } else {
            throw Error("Path to project required");
        }
    }
}

module.exports = {
    ModuleController: ModuleController
}
