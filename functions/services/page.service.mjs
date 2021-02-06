import {readdir, readFile, writeFile} from 'fs';
import {join} from 'path';
import {promisify} from 'util';
import {AppUtil} from "../utils/app.util.mjs";

export class PageService {

    /**
     *
     * @param storageService {StorageUtil}
     * @param appUtil {AppUtil}
     */
    constructor(storageService, appUtil) {
        this.storageService = storageService;
        this.appUtil = appUtil;
    }

    async getPages(project, module) {
        try {
            const projectPath = this.storageService.getConfig(`${project}:projectPath`);
            const pagesDir = join(projectPath, 'modules', module, 'pages');
            return promisify(readdir)(pagesDir);
        } catch (e) {
            return [];
        }
    }

    async getStates(project, module) {
        try {
            const projectPath = this.storageService.getConfig(`${project}:projectPath`);
            const pagesDir = join(projectPath, 'modules', module, 'states');
            return promisify(readdir)(pagesDir);
        } catch (e) {
            return [];
        }
    }

    async getStyles(project, module) {
        try {
            const projectPath = this.storageService.getConfig(`${project}:projectPath`);
            const pagesDir = join(projectPath, 'modules', module, 'styles');
            return promisify(readdir)(pagesDir);
        } catch (e) {
            return [];
        }
    }

    /**
     *
     * @param pageName - {string} page name
     * @param project - {string} current project
     * @param module - {string} current module
     * @return {Promise<{
     *     template: string,
     *     name: string,
     *     injections: Array<*>,
     *     styles: Array<string>,
     *     methods: Array<*>
     * }>}
     */
    async pageFileToJson(project, module, pageName) {
        if (pageName.toString().includes('.page.ts')) {
            pageName = pageName.toString().split('.')[0];
        }
        const projectPath = this.storageService.getConfig(`${project}:projectPath`);
        const pageFile = await promisify(readFile)(join(
            projectPath, 'modules', module, 'pages', `${pageName}.page.ts`)
        );
        const pageJsonFile = {};
        pageJsonFile.name = pageName;
        pageJsonFile.injections = this._getStateInjectionsFromPageFile(pageFile);
        pageJsonFile.styles = this._geStylesFromPageFile(pageFile);
        pageJsonFile.template = this._getTemplateFromPageFile(pageFile);
        // pageJsonFile.fields = this._getPageFieldFromPageFile(pageFile);
        pageJsonFile.methods = this.appUtil.getMethodsFromFile(pageFile);
        return pageJsonFile;
    }

    /**
     *
     * @param page - {{
     *     name: string,
     *     injections: {
     *         name: string,
     *         page: string
     *     }[],
     *     methods: {
     *         name: string,
     *         inputs: string,
     *         return: string,
     *         body: string
     *     }[]
     * }}
     * @param project - {string}
     * @param module - {string}
     * @return {Promise<any>}
     */
    async jsonToPageFile(page, project, module) {
        const projectPath = this.storageService.getConfig(`${project}:projectPath`);
        const pageInjectionsWithType = page.injections
            .map(x => 'public readonly ' + x.name + ': ' + this._firstCaseUpper(x.state) + 'State')
            .join(',');
        //     const fields = page.fields.map(x => {
        //         return `
        // ${x.name}: any;`
        //     }).join('');
        const onStartExist = page.methods.filter(x => x.name === 'ngOnInit');
        if (onStartExist.length === 0) {
            page.methods.push({
                name: 'ngOnInit',
                inputs: '',
                return: 'void',
                body: ''
            });
        }
        const onDestroyExist = page.methods.filter(x => x.name === 'ngOnDestroy');
        if (onDestroyExist.length === 0) {
            page.methods.push({
                name: 'ngOnDestroy',
                inputs: '',
                return: 'void',
                body: ''
            });
        }
        const methods = page.methods.map(x => {
            return `
    async ${x.name}(${x.inputs}): Promise<any> {
        ${x.body.toString().trim()}
    }`
        }).join('\n');

        await promisify(writeFile)(join(projectPath, 'modules', module, 'pages', `${page.name}.page.ts`),
            `import {bfast, BFast} from 'bfastjs';
import {Component, EventEmitter, Input, OnInit, Output, OnDestroy} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
${this._getPageImports(page.injections)}

@Component({
    selector: 'app-${page.name}',
    template: \`${page.template}\`,
    styleUrls: [${this._getPageStylesFromJson(page.styles)}]
})
export class ${this._firstCaseUpper(page.name)}Page implements OnInit, OnDestroy{
    constructor(${pageInjectionsWithType}){
    }
    ${methods}
}

`);
        return 'done write page'
    }

    _getPageImports(injections = []) {
        let im = '';
        for (const injection of injections) {
            const pageName = this._firstCaseUpper(injection.state)
            im += `import {${pageName}State} from '../states/${injection.state.toLowerCase()}.state';\n`
        }
        return im;
    }

    _getPageStylesFromJson(styles = []) {
        if (styles) {
            return styles.map(style => {
                style = style.toString().replace('.style.scss', '').trim()
                return `\'../styles/${style}.style.scss\'`;
            });
        } else {
            return [];
        }
    }

    _firstCaseUpper(name) {
        return name.toLowerCase().split('').map((value, index, array) => {
            if (index === 0) {
                return value.toUpperCase();
            }
            return value;
        }).join('');
    }

    _getStateInjectionsFromPageFile(pageFile) {
        const reg = new RegExp('constructor\\(.*\\)');
        const results = pageFile.toString().match(reg) ? pageFile.toString().match(reg)[0] : [];
        if (results) {
            return results.toString()
                .replace(new RegExp('(constructor\\()*(public)*(readonly)*\\)*', 'gim'), '')
                .split(',')
                .filter(x => x !== '')
                .map(x => {
                    return {
                        name: x.split(':')[0] ? x.split(':')[0].trim() : '',
                        state: x.split(':')[1] ? x.split(':')[1].replace('State', '').toLowerCase().trim() : ''
                    }
                });
        } else {
            return [];
        }
    }

    _getPageFieldFromPageFile(pageFile) {
        const reg = new RegExp('(\\w)+(:).*(\\;)', 'ig');
        const results = pageFile.toString().match(reg) ? pageFile.toString().match(reg) : [];
        if (results) {
            return results.map(x => x.toString().split(':')[0])
                // .replace(new RegExp('(:){1}.*(\\;){1}', 'gim'), '')
                .filter(x => x !== '')
                .map(x => {
                    return {
                        name: x.trim(),
                        field: x.trim(),
                        type: 'any'
                    }
                });
        } else {
            return [];
        }
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param pageName - {string}
     */
    async createPage(project, module, pageName) {
        pageName = pageName.toString().replace('.page.ts', '');
        const pages = await this.getPages(project, module);
        const exists = pages.filter(x => x === pageName.toString().concat('.page.ts'));
        if (exists && Array.isArray(pages) && exists.length > 0) {
            throw new Error('Page already exist');
        } else {
            return this.jsonToPageFile({
                name: pageName,
                injections: [],
                fields: [],
                methods: []
            }, project, module);
        }
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param page - {string}
     * @param method - {{
     *     name: string,
     *     inputs: string,
     *     return: string,
     *     body: string
     * }}
     * @return {Promise<void>}
     */
    async addMethod(project, module, page, method) {
        page = page.toString();
        const pageJson = await this.pageFileToJson(project, module, page);
        const exists = pageJson.methods.filter(x => x.name === method.name.toString());
        if (exists && Array.isArray(exists) && exists.length > 0) {
            throw new Error('Page method already exist');
        } else {
            pageJson.methods.push(method);
            return this.jsonToPageFile(pageJson, project, module);
        }
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param page - {string}
     * @param method - {string}
     * @return {Promise<any>}
     */
    async getMethod(project, module, page, method) {
        const pageJson = await this.pageFileToJson(project, module, page);
        const exists = pageJson.methods.filter(x => x.name === method.toString());
        if (exists && Array.isArray(exists) && exists.length > 0) {
            return exists[0];
        } else {
            throw new Error('Page method does not exist');
        }
    }

    async getTemplate(project, module, page) {
        const pageJson = await this.pageFileToJson(project, module, page);
        return pageJson.template;
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param page - {string}
     * @param method - {string}
     * @param update - {{
     *     name: string,
     *     inputs: string,
     *     body: string,
     *     return: string
     * }}
     * @return {Promise<any>}
     */
    async updateMethod(project, module, page, method, update) {
        const pageJson = await this.pageFileToJson(project, module, page);
        pageJson.methods = pageJson.methods.map(x => {
            if (x.name === method.toString()) {
                return update;
            } else {
                return x;
            }
        });
        return this.jsonToPageFile(pageJson, project, module);
    }

    async updateTemplate(project, module, page, template) {
        const pageJson = await this.pageFileToJson(project, module, page);
        pageJson.template = template;
        return this.jsonToPageFile(pageJson, project, module);
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param page - {string}
     * @param method - {string}
     * @return {Promise<any>}
     */
    async deleteMethod(project, module, page, method) {
        const pageJson = await this.pageFileToJson(project, module, page);
        pageJson.methods = pageJson.methods.filter(x => x.name !== method.toString());
        return this.jsonToPageFile(pageJson, project, module);
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param page - {string} current page which want injection
     * @return {Promise<*>}
     */
    async getInjections(project, module, page) {
        const allPages = await this.getPages(project, module);
        return allPages.filter(x => x !== page);
    }

    _geStylesFromPageFile(pageFile) {
        const reg = new RegExp('(styleUrls.*\:).*[\\[.*\\]]', 'ig');
        const results = pageFile.toString().match(reg) ? pageFile.toString().match(reg)[0] : [];
        if (results) {
            return results.toString()
                .replace(new RegExp('(styleUrls:).[\\[]', 'gim'), '')
                .trim()
                .replace(']', '')
                .trim()
                .split(',')
                .filter(x => x !== '')
                .map(x => {
                    return x.replace('\'../styles/', '').replace('.style.scss\'', '').trim();
                });
        } else {
            return [];
        }
    }

    _getTemplateFromPageFile(pageFile) {
        const reg = new RegExp('template:.*((.|\\n)*)\\`', 'ig');
        const results = pageFile.toString().match(reg) ? pageFile.toString().match(reg)[0] : [];
        if (results) {
            return results.toString()
                .replace(new RegExp('template.*\:', 'gim'), '')
                .replace('\`', '')
                .replace('\`', '')
                .trim();
        } else {
            return [];
        }
    }
}
