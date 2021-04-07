import {readdir, readFile, writeFile} from 'fs';
import {join} from 'path';
import {promisify} from 'util';
import {AppUtil} from "../utils/app.util.mjs";

export class ComponentService {

    /**
     *
     * @param storageService {StorageUtil}
     * @param appUtil {AppUtil}
     */
    constructor(storageService, appUtil) {
        this.storageService = storageService;
        this.appUtil = appUtil;
    }

    async getComponents(project, module) {
        try {
            const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
            const componentsDir = join(projectPath, 'modules', module, 'components');
            /**
             *
             * @type {string[]}
             */
            const components = await promisify(readdir)(componentsDir);
            return components.filter(x => x !== '' && x.toString().includes('.component'));
        } catch (e) {
            return [];
        }
    }

    /**
     *
     * @param componentName - {string} component name
     * @param project - {string} current project
     * @param module - {string} current module
     * @return {Promise<{
     *     template: string,
     *     name: string,
     *     injections: Array<*>,
     *     styles: Array<string>,
     *     methods: Array<*>,
     *     imports: Array<*>
     * }>}
     */
    async componentFileToJson(project, module, componentName) {
        if (componentName.toString().includes('.component.ts')) {
            componentName = componentName.toString().split('.')[0];
        }
        const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
        const componentFile = await promisify(readFile)(join(
            projectPath, 'modules', module, 'components', `${componentName}.component.ts`)
        );
        const componentJsonFile = {};
        componentJsonFile.name = componentName;
        componentJsonFile.imports = this.getUserImportsFromComponentFile(componentFile);
        componentJsonFile.injections = this.appUtil.getInjectionsFromFile(
            componentFile,
            componentJsonFile.imports.map(x => x.name),
            'State'
        );
        componentJsonFile.styles = this.geStylesFromComponentFile(componentFile);
        componentJsonFile.template = this.getTemplateFromComponentFile(componentFile);
        componentJsonFile.fields = this.getComponentFieldFromComponentFile(componentFile);
        componentJsonFile.methods = this.appUtil.getMethodsFromFile(componentFile);
        return componentJsonFile;
    }

    /**
     *
     * @param component - {{
     *     name: string,
     *     injections: {
     *         name: string,
     *         component: string
     *     }[],
     *     imports: Array<*>,
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
    async jsonToComponentFile(component, project, module) {
        const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
        const componentInjectionsWithType = component.injections.map(x => 'public readonly '
            + this.appUtil.firstCaseLower(this.appUtil.kebalCaseToCamelCase(x.name))
            + ': '
            + (x.auto === true ? this.appUtil.firstCaseUpper(this.appUtil.kebalCaseToCamelCase(x.service)).concat('State') : x.service)
        ).join(',\n                ');
        const fields = component.fields.map(x => {
            return x.value.toString().trim() + ';'
        }).join('\n    ');
        const onStartExist = component.methods.filter(x => x.name === 'ngOnInit');
        if (onStartExist.length === 0) {
            component.methods.push({
                name: 'ngOnInit',
                inputs: '',
                return: 'void',
                body: ''
            });
        }
        const onDestroyExist = component.methods.filter(x => x.name === 'ngOnDestroy');
        if (onDestroyExist.length === 0) {
            component.methods.push({
                name: 'ngOnDestroy',
                inputs: '',
                return: 'void',
                body: ''
            });
        }
        const methods = component.methods.map(x => {
            return `
    async ${x.name}(${x.inputs}): Promise<any> {
        ${x.body.toString().trim()}
    }`
        }).join('\n');

        await promisify(writeFile)(join(projectPath, 'modules', module, 'components', `${component.name}.component.ts`),
            `import {bfast, BFast} from 'bfastjs';
import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
${this.getStateImports(component.injections)}
${this.getLibImports(component.imports.filter(s => typeof s.readonly === "boolean" && s.readonly === false))}

@Component({
    selector: 'app-${component.name}',
    template: \`${component.template}\`,
    styleUrls: [${this.getComponentStylesFromJson(component.styles)}]
})
export class ${this.appUtil.firstCaseUpper(this.appUtil.kebalCaseToCamelCase(component.name))}Component implements OnInit, OnDestroy{

    ${fields}
    
    constructor(${componentInjectionsWithType}){
    }
    ${methods}
}

`);
        return 'done write component'
    }

    /**
     * get state imports for write to file
     * @param injections {Array<*>}
     * @return {string}
     */
    getStateImports(injections = []) {
        let im = '';
        for (const injection of injections.filter(x => x.auto && x.auto === true)) {
            const componentName = this.appUtil.firstCaseUpper(this.appUtil.kebalCaseToCamelCase(injection.service));
            im += `import {${componentName}State} from '../states/${injection.service}.state';\n`
        }
        return im;
    }

    /**
     *
     * @param imports {Array<{name: string, ref: string, type: string}>}
     * @return {string}
     */
    getLibImports(imports) {
        let im = '';
        for (const imp of imports) {
            if (imp.type === 'common') {
                im += `import ${imp.name} from '${imp.ref}';\n`
            } else {
                im += `import {${imp.name}} from '${imp.ref}';\n`
            }
        }
        return im;
    }

    getComponentStylesFromJson(styles = []) {
        if (styles) {
            return styles.map(style => {
                style = style.toString().replace('.style.scss', '').trim()
                return `\'../styles/${style}.style.scss\'`;
            });
        } else {
            return [];
        }
    }

    getStateInjectionsFromComponentFile(componentFile) {
        const reg = new RegExp('constructor\\(.*\\)');
        const results = componentFile.toString().match(reg) ? componentFile.toString().match(reg)[0] : [];
        if (results) {
            return results.toString()
                .replace(new RegExp('(constructor\\()*(public)*(readonly)*\\)*', 'gim'), '')
                .split(',')
                .filter(x => x !== '')
                .map(x => {
                    return {
                        name: x.split(':')[0] ? x.split(':')[0].trim() : '',
                        state: this.appUtil.camelCaseToKebal(x.split(':')[1] ? x.split(':')[1].replace('State', '').trim() : '')
                    }
                });
        } else {
            return [];
        }
    }

    getComponentFieldFromComponentFile(componentFile) {
        const fieldBodyReg = new RegExp('(export)(.|\\n)*(class)(.|\\n)*(constructor)(\\W|\\n)*\\(', 'ig');
        const headReplacerReg = new RegExp('(export)(.|\\n)*(class)(.|\\n)+?\\{', 'ig');
        const footReplacerReg = new RegExp('(constructor)(\\W|\\n)*\\(', 'ig');
        const fieldsReg = new RegExp('[\\w@](.|\\n)+?(:|=)(.|\\n)+?;', 'ig');
        let fields = componentFile.toString().match(fieldBodyReg) ?
            componentFile.toString().match(fieldBodyReg)[0]
            : '';
        fields = fields.toString()
            .replace(headReplacerReg, '')
            .replace(footReplacerReg, '')
            .trim();
        const results = fields.match(fieldsReg)
            ? fields.match(fieldsReg)
            : []
        if (results) {
            return results.map(x => x.toString().trim())
                // .replace(new RegExp('(:){1}.*(\\;){1}', 'gim'), '')
                .filter(x => x !== '')
                .map(x => {
                    return {
                        value: x.toString().replace(new RegExp(';', 'ig'), '').trim(),
                        name: x.toString().split(':')[0]
                    }
                });
        } else {
            return [];
        }
    }

    /**
     *
     * @param project {string}
     * @param module {string}
     * @param componentName {string}
     */
    async createComponent(project, module, componentName) {
        componentName = componentName.toString().replace('.component.ts', '');
        componentName = componentName.replace(new RegExp('[^A-Za-z0-9-]*', 'ig'), '');
        componentName = componentName.replace(new RegExp('([-]{2,})', 'ig'), '-');
        if (componentName && componentName !== '') {
            const components = await this.getComponents(project, module);
            const exists = components.filter(x => x === componentName.toString().concat('.component.ts'));
            if (exists && Array.isArray(components) && exists.length > 0) {
                throw new Error('Component already exist');
            } else {
                return this.jsonToComponentFile({
                    name: componentName,
                    injections: [],
                    imports: [],
                    fields: [],
                    methods: []
                }, project, module);
            }
        } else {
            throw new Error('Component must be alphanumeric only');
        }
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param component - {string}
     * @param method - {{
     *     name: string,
     *     inputs: string,
     *     return: string,
     *     body: string
     * }}
     * @return {Promise<void>}
     */
    async addMethod(project, module, component, method) {
        component = component.toString();
        const componentJson = await this.componentFileToJson(project, module, component);
        const exists = componentJson.methods.filter(x => x.name === method.name.toString());
        if (exists && Array.isArray(exists) && exists.length > 0) {
            throw new Error('Component method already exist');
        } else {
            componentJson.methods.push(method);
            return this.jsonToComponentFile(componentJson, project, module);
        }
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param component - {string}
     * @param method - {string}
     * @return {Promise<any>}
     */
    async getMethod(project, module, component, method) {
        const componentJson = await this.componentFileToJson(project, module, component);
        const exists = componentJson.methods.filter(x => x.name === method.toString());
        if (exists && Array.isArray(exists) && exists.length > 0) {
            return exists[0];
        } else {
            throw new Error('Component method does not exist');
        }
    }

    async getTemplate(project, module, component) {
        const componentJson = await this.componentFileToJson(project, module, component);
        return componentJson.template;
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param component - {string}
     * @param method - {string}
     * @param update - {{
     *     name: string,
     *     inputs: string,
     *     body: string,
     *     return: string
     * }}
     * @return {Promise<any>}
     */
    async updateMethod(project, module, component, method, update) {
        const componentJson = await this.componentFileToJson(project, module, component);
        componentJson.methods = componentJson.methods.map(x => {
            if (x.name === method.toString()) {
                return update;
            } else {
                return x;
            }
        });
        return this.jsonToComponentFile(componentJson, project, module);
    }

    async updateTemplate(project, module, component, template) {
        const componentJson = await this.componentFileToJson(project, module, component);
        componentJson.template = template;
        return this.jsonToComponentFile(componentJson, project, module);
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param component - {string}
     * @param method - {string}
     * @return {Promise<any>}
     */
    async deleteMethod(project, module, component, method) {
        const componentJson = await this.componentFileToJson(project, module, component);
        componentJson.methods = componentJson.methods.filter(x => x.name !== method.toString());
        return this.jsonToComponentFile(componentJson, project, module);
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param component - {string} current component which want injection
     * @return {Promise<*>}
     */
    async getInjections(project, module, component) {
        const allComponents = await this.getComponents(project, module);
        return allComponents.filter(x => x !== component);
    }

    /**
     * add state to a component
     * @param project {string}
     * @param module {string}
     * @param component {string}
     * @param injection {string}
     * @returns {Promise<*>}
     */
    async addInjection(project, module, component, injection) {
        injection = injection.toString().replace('.state.ts', '');
        const injectionName = this.appUtil.firstCaseLower(this.appUtil.kebalCaseToCamelCase(injection).concat('State'));
        return this.componentFileToJson(project, module, component).then(async value => {
            if (value && value.injections && Array.isArray(value.injections)) {
                const exist = value.injections.filter(x => x.name === injectionName);
                if (exist.length === 0) {
                    value.injections.push({
                        name: injectionName.trim(),
                        service: this.appUtil.camelCaseToKebal(injection.trim()),
                        auto: true
                    });
                    await this.jsonToComponentFile(value, project, module)
                }
            }
            return {message: 'injection added to component'};
        });
    }

    /**
     *
     * @param project {string}
     * @param module {string}
     * @param component {string}
     * @param injection {string}
     * @return {Promise<{message: string}>}
     */
    async addInjectionFromExternalLib(project, module, component, injection) {
        return this.componentFileToJson(project, module, component).then(async value => {
            if (value && value.injections && Array.isArray(value.injections)) {
                const exist = value.injections.filter(x => x.service.toString().trim() === injection.trim());
                if (exist.length === 0) {
                    value.injections.push({
                        name: this.appUtil.firstCaseLower(this.appUtil.kebalCaseToCamelCase(injection)).trim(),
                        service: injection.trim(),
                        auto: false
                    });
                    await this.jsonToComponentFile(value, project, module);
                }
            }
            return {message: 'lib updated to component'};
        })
    }

    /**
     * remove injected state from component resource
     * @param project {string}
     * @param module {string}
     * @param component {string}
     * @param injection {string} injection reference
     * @returns {Promise<*>}
     */
    async deleteInjection(project, module, component, injection) {
        injection = injection.replace('.state.ts', '');
        return this.componentFileToJson(project, module, component).then(async value => {
            if (value && value.injections && Array.isArray(value.injections)) {
                value.injections = value.injections.filter(x => x.service.toString().trim()
                    !== injection.toString().trim());
                await this.jsonToComponentFile(value, project, module)
            }
            return {message: 'injection deleted from component'};
        });
    }

    /**
     *
     * @param project
     * @param module
     * @param component
     * @param importObj {{name: string, ref: string, type: string}}
     * @return {Promise<{message: string}>}
     */
    async addImport(project, module, component, importObj) {
        return this.componentFileToJson(project, module, component).then(async value => {
            if (value && value.imports && Array.isArray(value.imports)) {
                const exist = value.imports.filter(
                    x => x.name.trim() === importObj.name.trim()
                );
                if (exist.length === 0) {
                    value.imports.push({
                        name: importObj.name,
                        type: importObj.type,
                        readonly: false,
                        ref: importObj.ref.toString(),
                    });
                    await this.jsonToComponentFile(value, project, module);
                }
            }
            return {message: 'imports updated'};
        })
    }

    /**
     * add style to component
     * @param project {string}
     * @param module {string}
     * @param component {string}
     * @param style {string}
     * @returns {Promise<*>}
     */
    async addStyle(project, module, component, style) {
        return this.componentFileToJson(project, module, component).then(async value => {
            if (value && value.styles && Array.isArray(value.styles)) {
                const exist = value.styles.filter(x => x.toString().toLowerCase()
                    === style.toString().split('.')[0].toLowerCase());
                if (exist.length === 0) {
                    value.styles.push(style.toString().split('.')[0]);
                    await this.jsonToComponentFile(value, project, module);
                }
            }
            return {message: 'style added to component'};
        });
    }

    /**
     * delete style from component
     * @param project {string}
     * @param module {string}
     * @param component {string}
     * @param style {string}
     * @returns {Promise<*>}
     */
    async deleteStyle(project, module, component, style) {
        return this.componentFileToJson(project, module, component).then(async value => {
            if (value && value.styles && Array.isArray(value.styles)) {
                value.styles = value.styles.filter(x => x.toString().toLowerCase()
                    !== style.toString().split('.')[0].toLowerCase());
                await this.jsonToComponentFile(value, project, module)
            }
            return {message: 'style deleted from component'};
        });
    }

    /**
     * add field to a component
     * @param project {string}
     * @param module {string}
     * @param component {string}
     * @param field {string}
     * @returns {Promise<*>}
     */
    async addField(project, module, component, field) {
        if (!field) {
            throw {message: 'Field required'};
        }
        if (field.includes('=')) {
            if (!field.includes(':')) {
                const fieldParts = field.split('=');
                field = `${fieldParts[0]}: any = ${fieldParts[1]}`;
            }
        } else {
            field = field.concat(': any = null');
        }
        field = field.replace(new RegExp('[\;]', 'g'), '').trim();
        return this.componentFileToJson(project, module, component).then(async value => {
            if (value && value.fields && Array.isArray(value.fields)) {
                const exist = value.fields.filter(
                    x => x.name.toString().toLowerCase().trim() === field.split(':')[0].toString().toLowerCase().trim()
                );
                if (exist.length === 0) {
                    value.fields.push({
                        name: field.toString().split(':')[0].trim(),
                        value: field.toString().trim(),
                    });
                    await this.jsonToComponentFile(value, project, module);
                }
            }
            return {message: 'field added to component'};
        });
    }

    /**
     * delete a field from a component
     * @param project {string}
     * @param module {string}
     * @param component {string}
     * @param field {string}
     * @returns {Promise<*>}
     */
    async deleteField(project, module, component, field) {
        return this.componentFileToJson(project, module, component).then(async value => {
            if (value && value.fields && Array.isArray(value.fields)) {
                value.fields = value.fields.filter(x => x.name.toString().toLowerCase().trim()
                    !== field.toString().toLowerCase().trim());
                await this.jsonToComponentFile(value, project, module);
            }
            return {message: 'field removed from component'};
        });
    }

    geStylesFromComponentFile(componentFile) {
        const reg = new RegExp('(styleUrls.*\:).*[\\[.*\\]]', 'ig');
        const results = componentFile.toString().match(reg) ? componentFile.toString().match(reg)[0] : [];
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

    getTemplateFromComponentFile(componentFile) {
        const reg = new RegExp('(template)(\\s|\\n)*:(\\s|\\n)*`(.|\\n)*?`', 'ig');
        const results = componentFile.toString().match(reg) ? componentFile.toString().match(reg)[0] : [];
        if (results) {
            return results.toString()
                .replace(new RegExp('(template)(\\s|\\n)*?:', 'gi'), '')
                .replace(new RegExp('\`', 'ig'), '')
                // .replace('\`', '')
                .trim();
        } else {
            return [];
        }
    }

    /**
     *
     * @param serviceFile
     * @return {*[]|{ref: string|null, name: string|null, type: string}[]}
     * @private
     */
    getUserImportsFromComponentFile(serviceFile) {
        const reg = new RegExp('(import).*(.|\\n)*(from).*;', 'ig');
        let results = serviceFile.toString().match(reg) ? serviceFile.toString().match(reg)[0] : [];
        if (results) {
            results = results.toString()
                .replace(new RegExp('(import).*(\\.service).*;', 'ig'), '')
                .replace(new RegExp('(import).*(\\.state).*;', 'ig'), '')
                .replace(new RegExp('(\\n){2,}', 'ig'), '\n')
                .trim()
                .split('\n')
                .filter(y => (typeof y === "string" && y.length > 1))
                .map(x => {
                    const isModule = x.includes('{') && x.includes('}');
                    const xParts = x.replace('import', '')
                        .replace('{', '')
                        .replace('}', '')
                        .replace(';', '')
                        .trim()
                        .split('from');
                    return {
                        name: xParts[0] ? xParts[0].trim() : null,
                        type: isModule ? 'module' : 'common',
                        readonly: false,
                        ref: xParts[1] ? xParts[1].replace(new RegExp('[\'\"]', 'ig'), '').trim() : null
                    }
                });
            return this.appUtil.multipleImportToSingleImportOfLib(results, AppUtil.readonlyComponentImports);
        }
        return [];
    }
}
