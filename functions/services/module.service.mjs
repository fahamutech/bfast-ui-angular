import {mkdir, readdir, readFile, writeFile} from 'fs';
import {join} from 'path';
import {promisify} from 'util';
import {StorageUtil} from '../utils/storage.util.mjs'
import {AppUtil} from "../utils/app.util.mjs";

export class ModuleService {

    /**
     * @param storageService {StorageUtil}
     */
    constructor(storageService) {
        this.storageService = storageService;
    }

    /**
     *
     * @returns {Promise<{modules: Array<string>, name: string}>}
     */
    async getModules(project) {
        const projectPath = this.storageService.getConfig(`${project}:projectPath`);
        const mainModuleName = this.storageService.getConfig(`${project}:module`);
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
        try {
            const projectPath = this.storageService.getConfig(`${project}:projectPath`);
            const mainModule = this.storageService.getConfig(`${project}:module`);
            if (projectPath && project) {
                const fileBuffer = await promisify(readFile)(join(projectPath, `${mainModule}.module.ts`));
                return fileBuffer.toString();
            } else {
                return '';
            }
        } catch (e) {
            return '';
        }
    }

    async getOtherModuleContents(project, module) {
        const projectPath = this.storageService.getConfig(`${project}:projectPath`);
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
        const projectPath = this.storageService.getConfig(`${project}:projectPath`);
        const mainModule = this.storageService.getConfig(`${project}:module`);
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
        const projectPath = this.storageService.getConfig(`${project}:projectPath`);
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

    /**
     *
     * @param project {string}
     * @param module {string}
     * @return {Promise<{
     *     name: string,
     *     routes: {
     *         path: string,
     *         guards: Array<*>,
     *         component: *
     *     },
     *     declarations: Array<*>,
     *     exports: Array<*>,
     *     imports: Array<{name: string, ref: string}>,
     *     injections: Array<{name: string, service: string}>,
     *     constructor: string
     * }>}
     */
    async moduleFileToJson(project, module) {
        if (module.toString().includes('.module.ts')) {
            module = module.toString().split('.')[0];
        }
        const projectPath = this.storageService.getConfig(`${project}:projectPath`);
        const moduleFile = await promisify(readFile)(join(
            projectPath, 'modules', module, `${module}.module.ts`)
        );
        const moduleJson = {};
        moduleJson.name = module;
        moduleJson.routes = this._getRoutesFromModuleFile(moduleFile);
        moduleJson.declarations = await this._getDeclarationsFromModuleFolder(project, module);
        moduleJson.exports = this._getExportsFromModuleFile(moduleFile);
        moduleJson.imports = this._getUserImportsFromModuleFile(moduleFile);
        moduleJson.injections = AppUtil.getInjectionsFromFile(moduleFile);
        moduleJson.constructor = AppUtil.getConstructorBodyFromModuleFile(moduleFile);
        console.log(moduleJson);
        return moduleJson;
    }

    /**
     *
     * @param moduleFile{string}
     * @return {Array<*>}
     * @private
     */
    _getRoutesFromModuleFile(moduleFile) {
        const reg = new RegExp('const.*routes.*\:.*\=.*\\[(.|\\n)*\];', 'ig');
        const results = moduleFile.toString().match(reg) ? moduleFile.toString().match(reg)[0] : [];
        if (results) {
            const routesString = results.toString()
                .replace(new RegExp('const.*routes.*\:.*\=', 'gim'), '')
                .replace(';', '')
                .trim();
            let routesItemsMatch = routesString.toString().match(new RegExp('\{.*\}', 'igm'));
            if (!routesItemsMatch) {
                routesItemsMatch = []
            }
            let routesItems = routesItemsMatch
                .map(x =>
                    x.replace('{', '')
                        .replace('}', '')
                        .split(',')
                        .map(y =>
                            y.replace(new RegExp('{', 'ig'), '')
                                .replace(new RegExp('}', 'ig'), '')
                                .trim()
                                .split(':')
                                .map(z =>
                                    z.replace(new RegExp('\'', 'ig'), '')
                                        .replace(new RegExp('\"', 'ig'), '')
                                        .trim()
                                )
                        )
                );
            routesItems = routesItems.map(x => {
                const routeObject = {};
                for (const _x of x) {
                    if (_x[0] === 'canActivate') {
                        routeObject.guards = _x[1].toString()
                            .replace(new RegExp('\\[', 'ig'), '')
                            .replace(new RegExp('\]', 'ig'), '')
                            .trim()
                            .split(',')
                            .map(x =>
                                x.replace('Guard', '')
                                    .trim()
                            );
                    } else if (_x[0] === 'component') {
                        routeObject.page = _x[1].toString().replace('Page', '').replace('Component', '').trim();
                    } else {
                        routeObject[_x[0]] = _x[1];
                    }
                    if (!routeObject.guards) {
                        routeObject.guards = [];
                    }
                }
                return routeObject;
            });
            return routesItems;
        } else {
            return [];
        }
    }

    _getDeclarationsFromModuleFile(moduleFile) {
        const reg = new RegExp('(declarations.*:.*\\[)((.|\\n)+?)(\].*\,)', 'ig');
        const results = moduleFile.toString().match(reg) ? moduleFile.toString().match(reg)[0] : [];
        if (results) {
            // const
            return [];
        } else {
            return [];
        }

    }

    async _getDeclarationsFromModuleFolder(project, module) {
        if (module.toString().includes('.module.ts')) {
            module = module.toString().split('.')[0];
        }
        const projectPath = this.storageService.getConfig(`${project}:projectPath`);
        /**
         *
         * @type {string[]}
         */
        let components = await promisify(readdir)(join(projectPath, 'modules', module, 'components'));
        /**
         *
         * @type {string[]}
         */
        let pages = await promisify(readdir)(join(projectPath, 'modules', module, 'pages'));

        components = components
            .map(x => AppUtil.firstCaseUpper(x.toString().replace('.component.ts', '').trim()).concat('Component'));
        pages = pages
            .map(x => AppUtil.firstCaseUpper(x.toString().replace('.page.ts', '').trim()).concat('Page'));
        const declarations = []
        declarations.push(...pages);
        declarations.push(...components);
        return declarations;
    }

    // exports can be only component for now
    _getExportsFromModuleFile(moduleFile) {
        const reg = new RegExp('(exports.*:.*\\[)((.|\\n)+?)(\].*\,)', 'ig');
        let results = moduleFile.toString().match(reg) ? moduleFile.toString().match(reg)[0] : [];
        if (results) {
            results = results.toString().replace(new RegExp('(exports.*:.*\\[)', 'ig'), '')
                .replace(new RegExp('(\].*\,)', 'ig'), '')
                .trim()
                .split(',')
                .filter(t => (typeof t === "string" && t.trim() !== ''))
                .map(x => x.replace('Component', '').trim());
            return results;
        } else {
            return [];
        }
    }

    // @angular module must be automated during save module file
    _getUserImportsFromModuleFile(moduleFile) {
        const reg = new RegExp('(import).*(.|\\n)*(from).*;', 'ig');
        let results = moduleFile.toString().match(reg) ? moduleFile.toString().match(reg)[0] : [];
        if (results) {
            results = results.toString()
                // remove angular core and material imports
                .replace(new RegExp('(import).*(@angular).*', 'ig'), '')
                // remove component imports
                .replace(new RegExp('(import).*(\\.\/component).*', 'ig'), '')
                // remove page imports
                .replace(new RegExp('(import).*(\\.\/page).*', 'ig'), '')
                // remove pipe imports
                .replace(new RegExp('(import).*(\\.\/pipe).*', 'ig'), '')
                // remove service import
                .replace(new RegExp('(import).*(\\.\/service).*', 'ig'), '')
                // remove space left behind
                .replace(new RegExp('(\\n){2,}', 'ig'), '\n')
                .trim()
                .split('\n')
                .filter(y => (typeof y === "string" && y.length > 1))
                .map(x => {
                    const xParts = x.replace('import', '')
                        .replace('{', '')
                        .replace('}', '')
                        .replace(';', '')
                        .trim()
                        .split('from');
                    return {
                        name: xParts[0] ? xParts[0].trim() : null,
                        ref: xParts[1] ? xParts[1].replace(new RegExp('[\'\"]', 'ig'), '').trim() : null
                    }
                });
            return results;
        } else {
            return [];
        }
    }

    /**
     *
     * @param project {string}
     * @param module {string}
     * @param moduleJson {{
     *     name: string,
     *     routes: {
     *         path: string,
     *         guards: Array<*>,
     *         component: *
     *     },
     *     declarations: Array<*>,
     *     exports: Array<*>,
     *     imports: Array<{name: string, ref: string}>,
     *     injections: Array<{name: string, service: string}>,
     *     constructor: string
     * }}
     * @return {Promise<*>}
     */
    async moduleJsonToFile(project, module, moduleJson) {

    }
}
