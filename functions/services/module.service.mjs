import {mkdir, readdir, readFile, writeFile} from 'fs';
import {join} from 'path';
import {promisify} from 'util';

export class ModuleService {

    /**
     * @param storageUtil
     */
    constructor(storageUtil) {
        this.storageUtil = storageUtil;
    }

    /**
     *
     * @returns {Promise<{modules: Array<string>, name: string}>}
     */
    async getModules(project) {
        const projectPath = this.storageUtil.getConfig(`${project}:projectPath`);
        const mainModuleName = this.storageUtil.getConfig(`${project}:module`);
        if (projectPath) {
            const modules = await promisify(readdir)(join(projectPath, 'modules'));
            return {
                name: mainModuleName,
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
    async getMainModuleContents(project) {
        try{
            const projectPath = this.storageUtil.getConfig(`${project}:projectPath`);
            const mainModule = this.storageUtil.getConfig(`${project}:module`);
            if (projectPath && project) {
                const fileBuffer = await promisify(readFile)(join(projectPath, `${mainModule}.module.ts`));
                return fileBuffer.toString();
            } else {
                return  '';
            }
        }catch (e){
            return  '';
        }
    }

    async getOtherModuleContents(project, module) {
        const projectPath = this.storageUtil.getConfig(`${project}:projectPath`);
        if (projectPath && project) {
            const fileBuffer = await promisify(readFile)(join(projectPath, 'modules', module, `${module}.module.ts`));
            return fileBuffer.toString();
        } else {
            throw Error("Main module not found");
        }
    }

    /**
     *
     * @param project
     * @param contents - {string}
     * @returns {Promise<unknown>}
     */
    async updateMainModuleContents(project, contents) {
        const projectPath = this.storageUtil.getConfig(`${project}:projectPath`);
        const mainModule = this.storageUtil.getConfig(`${project}:module`);
        if (contents) {
            return await promisify(writeFile)(join(projectPath, `${mainModule}.module.ts`), contents);
        } else {
            throw Error("module contents required");
        }
    }

    /**
     * create a new module with initial module codes
     * @param project
     * @param name - {string}
     * @param detail - {string}
     * @returns {Promise<void>}
     */
    async createModule(project, name, detail) {
        const projectPath = this.storageUtil.getConfig(`${project}:projectPath`);
        if (projectPath) {
            if (name && name !== '') {
                const resources = ["services", "models", "components", "pages", "states", "guards", "styles"]
                await promisify(mkdir)(join(projectPath, 'modules', name));
                for (const resource of resources) {
                    await promisify(mkdir)(join(projectPath, 'modules', name, resource));
                }
                return promisify(writeFile)(join(projectPath, 'modules', name, `${name}.module.ts`),
                    `import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class WebModule {
}
`);
            } else {
                throw Error("Module name required")
            }
        } else {
            throw Error("Path to project required");
        }
    }
}
