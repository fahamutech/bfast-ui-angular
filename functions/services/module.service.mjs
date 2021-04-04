import {mkdir, readdir, readFile, writeFile} from 'fs';
import {join} from 'path';
import {promisify} from 'util';
import {StorageUtil} from '../utils/storage.util.mjs'
import {ComponentService} from './component.service.mjs'
import {PageService} from './page.service.mjs'
import {AppUtil} from "../utils/app.util.mjs";

export class ModuleService {

    /**
     * @param storageService {StorageUtil}
     * @param componentService {ComponentService}
     * @param pageService {PageService}
     * @param appUtil {AppUtil}
     */
    constructor(storageService, componentService, pageService, appUtil) {
        this.storageService = storageService;
        this.componentService = componentService;
        this.pageService = pageService;
        this.appUtil = appUtil;
    }

    /**
     *
     * @returns {Promise<{modules: Array<string>, name: string}>}
     */
    async getModules(project) {
        const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
        const mainModuleName = await this.storageService.getConfig(`${project}:module`);
        if (projectPath) {
            const modules = await promisify(readdir)(join(projectPath, 'modules'));
            return {
                name: mainModuleName,
                modules: modules.filter(x => !x.toString().includes('.md'))
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
            const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
            const mainModule = await this.storageService.getConfig(`${project}:module`);
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
        const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
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
        const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
        const mainModule = await this.storageService.getConfig(`${project}:module`);
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
        const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
        name = name.toString().replace('.module.ts', '');
        name = name.replace(new RegExp('[^A-Za-z0-9-]*', 'ig'), '');
        name = name.replace(new RegExp('([-]{2,})', 'ig'), '');
        if (name && name === '') {
            throw new Error('Module must be alphanumeric');
        }
        if (projectPath) {
            if (name && name !== '') {
                const resources = ["services", "models", "components", "pages", "states", "guards", "styles"]
                await promisify(mkdir)(join(projectPath, 'modules', name));
                for (const resource of resources) {
                    await promisify(mkdir)(join(projectPath, 'modules', name, resource));
                    await promisify(writeFile)(join(projectPath, 'modules', name, resource, 'README.md'), `#${resource}`);
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
export class ${this.appUtil.firstCaseUpper(this.appUtil.kebalCaseToCamelCase(name))}Module {
    constructor(){
    }// end
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
     *         page: *
     *     }[],
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
        const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
        let moduleFile = await promisify(readFile)(join(
            projectPath, 'modules', module, `${module}.module.ts`)
        );
        moduleFile = moduleFile.toString();
        const moduleJson = {};
        moduleJson.name = module;
        moduleJson.routes = this.getRoutesFromModuleFile(moduleFile);
        moduleJson.declarations = await this.getDeclarationsFromModuleFolder(project, module);
        moduleJson.exports = this.getExportsFromModuleFile(moduleFile);
        moduleJson.imports = this.getUserImportsFromModuleFile(moduleFile);
        moduleJson.injections = this.appUtil.getInjectionsFromFile(moduleFile, [], 'Service');
        moduleJson.constructor = this.appUtil.getConstructorBodyFromModuleFile(moduleFile);
        return moduleJson;
    }

    /**
     *
     * @param project {string}
     * @return {Promise<{
     *     name: string,
     *     routes: {
     *         path: string,
     *         guards: Array<*>,
     *         ref: string,
     *         module: *
     *     }[],
     *     imports: Array<{name: string, ref: string}>,
     *     injections: Array<{name: string, service: string}>,
     *     constructor: string
     * }>}
     */
    async mainModuleFileToJson(project) {
        const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
        const module = await this.storageService.getConfig(`${project}:module`);
        let moduleFile = await promisify(readFile)(
            join(projectPath, `${module}.module.ts`)
        );
        moduleFile = moduleFile.toString();
        const moduleJson = {};
        moduleJson.name = this.appUtil.camelCaseToKebal(module);
        moduleJson.routes = this.getRoutesFromMainModuleFile(moduleFile);
        moduleJson.exports = this.getExportsFromModuleFile(moduleFile);
        moduleJson.imports = this.getUserImportsFromModuleFile(moduleFile).filter(x => x.name.toLowerCase() !== 'appcomponent');
        moduleJson.injections = this.appUtil.getInjectionsFromFile(moduleFile, [], 'Service');
        moduleJson.constructor = this.appUtil.getConstructorBodyFromModuleFile(moduleFile);
        // console.log(moduleJson);
        return moduleJson;
    }

    /**
     *
     * @param moduleFile{string}
     * @return {Array<*>}
     * @private
     */
    getRoutesFromModuleFile(moduleFile) {
        const reg = new RegExp('const.*routes.*\:.*\=.*\\[(.|\\n)*\];', 'ig');
        const results = moduleFile.toString().match(reg) ? moduleFile.toString().match(reg)[0] : [];
        if (results) {
            const routesString = results.toString()
                .replace(new RegExp('const.*routes.*\:.*\=', 'gim'), '')
                .replace(';', '')
                .trim();
            let routesItemsMatch = routesString.toString().match(new RegExp('\{(.|\\n)+?\}', 'igm'));
            if (!routesItemsMatch) {
                routesItemsMatch = [];
            }
            let routesItems = routesItemsMatch.map(x =>
                x.replace('{', '').replace('}', '').replace(new RegExp('].+?,', 'ig'), '],')
            );
            routesItems = routesItems.map(_x => {
                const routeObject = {};
                const path = _x.toString().match(new RegExp('path.+?,', 'ig')) ?
                    _x.toString().match(new RegExp('path.+?,', 'ig'))[0] : '';
                routeObject.path = path.toString()
                    .replace('path', '')
                    .replace(':', '')
                    .replace(',', '')
                    .replace(new RegExp('\'', 'ig'), '')
                    .replace(new RegExp('\"', 'ig'), '')
                    .trim();

                const page = _x.toString().match(new RegExp('component.*:.*', 'ig')) ?
                    _x.toString().match(new RegExp('component.*:.*', 'ig'))[0] : '';
                routeObject.page = page.toString()
                    .replace('component', '')
                    .replace(':', '')
                    .replace(',', '')
                    .replace('Page', '')
                    .replace(new RegExp('\'', 'ig'), '')
                    .replace(new RegExp('\"', 'ig'), '')
                    .trim();

                const guards = _x.toString().match(new RegExp('canActivate.*]', 'ig')) ?
                    _x.toString().match(new RegExp('canActivate.*]', 'ig'))[0] : '';
                routeObject.guards = guards.toString()
                    .replace('canActivate', '')
                    .replace(':', '')
                    .replace('[', '')
                    .replace(']', '')
                    .replace(new RegExp('\'', 'ig'), '')
                    .replace(new RegExp('\"', 'ig'), '')
                    .trim()
                    .split(',')
                    .map(t => t.toString().replace('Guard', '').trim())
                    .filter(z => z !== '');

                if (!routeObject.guards) {
                    routeObject.guards = [];
                }
                routeObject.guards = routeObject.guards.filter(x => x.toString() !== '');
                // }
                return routeObject;
            });
            return routesItems;
        } else {
            return [];
        }
    }

    /**
     *
     * @param moduleFile{string}
     * @return {Array<*>}
     * @private
     */
    getRoutesFromMainModuleFile(moduleFile) {
        const reg = new RegExp('const.*routes.*\:.*\=.*\\[(.|\\n)*\];', 'ig');
        const results = moduleFile.toString().match(reg) ? moduleFile.toString().match(reg)[0] : [];
        if (results) {
            const routesString = results.toString()
                .replace(new RegExp('const.*routes.*\:.*\=', 'gim'), '')
                .replace(';', '')
                .trim();
            let routesItemsMatch = routesString.toString().match(new RegExp('\{(.|\\n)+?\}', 'igm'));
            if (!routesItemsMatch) {
                routesItemsMatch = [];
            }
            let routesItems = routesItemsMatch.map(x =>
                x.replace('{', '').replace('}', '').replace(new RegExp('].+?,', 'ig'), '],')
            );
            routesItems = routesItems.map(_x => {
                const routeObject = {};
                const path = _x.toString().match(new RegExp('path.+?,', 'ig')) ?
                    _x.toString().match(new RegExp('path.+?,', 'ig'))[0] : '';
                routeObject.path = path.toString()
                    .replace('path', '')
                    .replace(':', '')
                    .replace(',', '')
                    .replace(new RegExp('\'', 'ig'), '')
                    .replace(new RegExp('\"', 'ig'), '')
                    .trim();

                routeObject.ref = _x.toString().match(new RegExp('(import).*\\(.*\\)\\.', 'ig')) ?
                    _x.toString().match(new RegExp('(import).*\\(.*\\)\\.', 'ig'))[0]
                        .replace('import', '')
                        .replace('(', '')
                        .replace(')', '')
                        .replace(new RegExp('\'', 'ig'), '')
                        .replace(new RegExp('\"', 'ig'), '')
                        .trim()
                        .split('')
                        .reverse()
                        .join('')
                        .substring(1)
                        .split('')
                        .reverse()
                        .join('')
                        .trim()
                    : '';

                const page = _x.toString().match(new RegExp('(loadChildren)(.|\\n)+?(\\.then)(.|\\n)+?\\)', 'ig')) ?
                    _x.toString().match(new RegExp('(loadChildren)(.|\\n)+?(\\.then)(.|\\n)+?\\)', 'ig'))[0] : '';
                const _y = page.toString().match(new RegExp('(mod\\.).*(Module)', 'ig')) ?
                    page.toString().match(new RegExp('(mod\\.).*(Module)', 'ig'))[0]
                    : '';
                routeObject.module = _y.toString()
                    .replace('mod.', '')
                    .replace('Module', '')
                    .replace(new RegExp('\'', 'ig'), '')
                    .replace(new RegExp('\"', 'ig'), '')
                    .trim();

                const guards = _x.toString().match(new RegExp('canActivate.*]', 'ig')) ?
                    _x.toString().match(new RegExp('canActivate.*]', 'ig'))[0] : '';
                routeObject.guards = guards.toString()
                    .replace('canActivate', '')
                    .replace(':', '')
                    .replace('[', '')
                    .replace(']', '')
                    .replace(new RegExp('\'', 'ig'), '')
                    .replace(new RegExp('\"', 'ig'), '')
                    .trim()
                    .split(',')
                    .map(t => t.toString().replace('Guard', '').trim())
                    .filter(z => z !== '');

                if (!routeObject.guards) {
                    routeObject.guards = [];
                }
                routeObject.guards = routeObject.guards.filter(x => x.toString() !== '');
                // }
                return routeObject;
            });
            return routesItems;
        } else {
            return [];
        }
    }

    async getDeclarationsFromModuleFolder(project, module) {
        if (module.toString().includes('.module.ts')) {
            module = module.toString().split('.')[0];
        }
        const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
        /**
         *
         * @type {string[]}
         */
        let components = await this.componentService.getComponents(project, module);
        /**
         *
         * @type {string[]}
         */
        let pages = await this.pageService.getPages(project, module);

        components = components.map(
            x => x.toString()
                .replace('.component.ts', '').trim()
                .split('-').map(
                    y => this.appUtil.firstCaseUpper(y)
                ).join('')
                .concat('Component')
        );
        pages = pages.map(
            x => x.toString()
                .replace('.page.ts', '').trim()
                .split('-').map(
                    y => this.appUtil.firstCaseUpper(y)
                ).join('')
                .concat('Page')
        );
        const declarations = []
        declarations.push(...pages);
        declarations.push(...components);
        return declarations;
    }

    getExportsFromModuleFile(moduleFile) {
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
        }
        return [];
    }

    getUserImportsFromModuleFile(moduleFile) {
        const reg = new RegExp('(import).*(.|\\n)*(from).*;', 'ig');
        let results = moduleFile.toString().match(reg) ? moduleFile.toString().match(reg)[0] : [];
        if (results) {
            results = results.toString()
                // remove component imports
                .replace(new RegExp('(import).*(\\.\/component).*', 'ig'), '')
                // remove page imports
                .replace(new RegExp('(import).*(\\.\/page).*', 'ig'), '')
                // remove pipe imports
                .replace(new RegExp('(import).*(\\.\/pipe).*', 'ig'), '')
                // remove guards imports
                .replace(new RegExp('(import).*(\\.\/guard).*', 'ig'), '')
                // remove bfast imports
                //.replace(new RegExp('(import).*(bfastjs).*', 'ig'), '')
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
                        readonly: false,
                        type: 'module',
                        ref: xParts[1] ? xParts[1].replace(new RegExp('[\'\"]', 'ig'), '').trim() : null
                    }
                });
            return this.appUtil.multipleImportToSingleImportOfLib(results, AppUtil.readonlyModulesImport)
        }
        return [];
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
     *         page: *
     *     }[],
     *     declarations: Array<*>,
     *     exports: Array<*>,
     *     imports: Array<{name: string, ref: string, readonly: boolean, type: string}>,
     *     injections: Array<{name: string, service: string}>,
     *     constructor: string
     * }}
     * @return {Promise<*>}
     */
    async moduleJsonToFile(project, module, moduleJson) {
        module = module.replace('.module.ts', '').trim();
        const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
        const moduleInjectionsWithType = moduleJson.injections.map(x => 'private readonly '
            + this.appUtil.firstCaseLower(this.appUtil.kebalCaseToCamelCase(x.name))
            + ': '
            + this.appUtil.firstCaseUpper(this.appUtil.kebalCaseToCamelCase(x.service))
            + 'Service'
        ).join(',');

        const moduleInString = `import {bfast} from 'bfastjs';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {Routes} from '@angular/router';
import {ROUTES} from '@angular/router';
${this.getServiceImports(moduleJson.injections)}
${this.getGuardsImports(moduleJson.routes)}
${await this.getComponentsImports(project, module)}
${await this.getPagesImports(project, module)}
${moduleJson.imports.filter(i => typeof i.readonly === "boolean" && i.readonly === false).map(x => `import {${x.name}} from '${x.ref}';`).join('\n')}

const routes: Routes = [
   ${this.getModuleRoutesFromModuleJson(moduleJson.routes)}
];

@NgModule({
  declarations: [
     ${moduleJson.declarations.map(x => x.toString().concat(',')).join('\n     ')}
  ],
  imports: [
    CommonModule,
    {
      ngModule: RouterModule,
      providers: [
        {
          multi: true,
          provide: ROUTES,
          useValue: routes
        }
      ]
    },
    ${moduleJson.imports.filter(i => typeof i.readonly === "boolean" && i.readonly === false).map(x => x.name.concat(',')).join('\n    ')}
  ],
  exports: [
    ${moduleJson.exports.map(x => x.toString().concat('Component,')).join('\n    ')}
  ],
})
export class ${this.appUtil.firstCaseUpper(this.appUtil.kebalCaseToCamelCase(moduleJson.name))}Module {
    constructor(${moduleInjectionsWithType}){
        ${moduleJson.constructor}
    }// end
}

`
        await promisify(writeFile)(
            join(projectPath, 'modules', moduleJson.name, `${moduleJson.name}.module.ts`), moduleInString
        );
        return 'done write module'
    }

    /**
     *
     * @param project {string}
     * @param moduleJson {{
     *     name: string,
     *     imports: Array<{name: string, ref: string, type: string, readonly: boolean}>,
     *     routes: {
     *         path: string,
     *         guards: Array<*>,
     *         ref: string,
     *         module: *
     *     }[],
     *     constructor: string
     * }}
     * @return {Promise<*>}
     */
    async mainModuleJsonToFile(project, moduleJson) {
        const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
        let module = await this.storageService.getConfig(`${project}:module`);
        module = module.replace('.module.ts', '').trim();

        const appComponentString = `import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {
}
`

        const moduleInString = `import {bfast} from 'bfastjs';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {RouterModule} from '@angular/router';
import {Routes} from '@angular/router';
${moduleJson.imports.filter(i => typeof i.readonly === "boolean" && i.readonly === false).map(x => `import {${x.name}} from '${x.ref}';`).join('\n')}

const routes: Routes = [
   ${this.getRoutesFromMainModuleJson(moduleJson.routes)}
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes),
    ${moduleJson.imports.filter(i => typeof i.readonly === "boolean" && i.readonly === false).map(x => x.name.concat(',')).join('\n    ')}
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class ${this.appUtil.firstCaseUpper(this.appUtil.kebalCaseToCamelCase(module))}Module {
    constructor(){
        ${moduleJson.constructor}
    }// end
}

`
        await promisify(writeFile)(
            join(projectPath, `app.component.ts`), appComponentString
        );
        await promisify(writeFile)(
            join(projectPath, `${this.appUtil.camelCaseToKebal(module)}.module.ts`), moduleInString
        );
        return 'done write main module'
    }

    /**
     *
     * @param routes {{
     *         path: string,
     *         guards: Array<*>,
     *         page: *
     *     }[]
     *     }
     * @private
     * @return {string}
     */
    getModuleRoutesFromModuleJson(routes) {
        return routes.map(x => {
            return `{ path: '${x.path}', canActivate: [ ${x.guards.filter(x => x !== '').map(y => y.toString().trim().concat('Guard')).join(',')} ], component: ${x.page}Page },`
        }).join('\n   ')
    }

    /**
     *
     * @param routes {{
     *         path: string,
     *         guards: Array<*>,
     *         ref: string,
     *         module: *
     *     }[]
     *     }
     * @private
     * @return {string}
     */
    getRoutesFromMainModuleJson(routes) {
        return routes.map(x => {
            return `{ path: '${x.path}', canActivate: [ ${x.guards.filter(x => x !== '').map(y => y.toString().trim().concat('Guard')).join(',')} ], loadChildren: () => import('${x.ref}').then(mod => mod.${x.module}Module) },`
        }).join('\n   ')
    }

    getServiceImports(injections = []) {
        let im = new Set();
        let result = '';
        for (const injection of injections) {
            const serviceName = this.appUtil.firstCaseUpper(this.appUtil.kebalCaseToCamelCase(injection.service));
            im.add(`import {${serviceName}Service} from './services/${injection.service}.service';`);
        }
        return result.concat(Array.from(im).filter(x => x !== '').join('\n'));
    }

    /**
     *
     * @param routes {{
     *         path: string,
     *         guards: Array<*>,
     *         page: *
     *     }[]
     *     }
     * @return {string}
     * @private
     */
    getGuardsImports(routes) {
        let im = new Set();
        let result = '';
        routes.forEach(route => {
            route.guards.forEach(guard => {
                const guardName = this.appUtil.firstCaseUpper(this.appUtil.kebalCaseToCamelCase(guard));
                let guardNameInKebal = this.appUtil.camelCaseToKebal(guardName);
                if (guardNameInKebal !== '') {
                    im.add(`import {${guardName}Guard} from './guards/${guardNameInKebal}.guard';`);
                }
            });
        });
        return result.concat(Array.from(im).filter(x => x !== '').join('\n'));
    }

    /**
     *
     * @param project {string} - current project
     * @param module {string} - current module
     * @return {Promise<string>}
     * @private
     */
    async getComponentsImports(project, module) {
        if (module.toString().includes('.module.ts')) {
            module = module.toString().split('.')[0];
        }
        const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
        /**
         *
         * @type {string[]}
         */
        let components = await this.componentService.getComponents(project, module);

        return components.map(x => {
            const componentName =
                this.appUtil.kebalCaseToCamelCase(x.toString().replace('.component.ts', ''))
                    .concat('Component');
            return `import {${this.appUtil.firstCaseUpper(componentName)}} from './components/${x.replace('.ts', '').trim()}';`
        }).join('\n');
    }

    /**
     *
     * @param project {string} - current project
     * @param module {string} - current module
     * @return {Promise<string>}
     * @private
     */
    async getPagesImports(project, module) {
        if (module.toString().includes('.module.ts')) {
            module = module.toString().split('.')[0];
        }
        const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
        /**
         *
         * @type {string[]}
         */
        let pages = await this.pageService.getPages(project, module);

        return pages.map(x => {
            const componentName =
                this.appUtil.kebalCaseToCamelCase(x.replace('.page.ts', ''))
                    .concat('Page');
            return `import {${componentName}} from './pages/${x.replace('.ts', '').trim()}';`
        }).join('\n');
    }

    getAngularMaterialImports() {
        return '';
    }

    /**
     *
     * @param project {string}
     * @return {Promise<*>}
     */
    async exportMainModule(project) {
        const projectInfo = await this.storageService.getConfig(project);
        const modules = await this.getModules(project);
        const _modulesMap = {};
        modules.modules.forEach(x => {
            _modulesMap[x] = {
                services: {},
                components: {},
                pages: {},
                guards: {},
                states: {},
                styles: {},
                modules: {}
            }
        });
        return {
            name: projectInfo.name,
            main: {
                name: projectInfo.module,
                modules: _modulesMap
            }
        }
    }
}
