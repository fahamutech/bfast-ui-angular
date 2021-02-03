import {readdir, readFile, writeFile} from 'fs';
import {join} from 'path';
import {promisify} from 'util';
import {AppUtil} from "../utils/app.util.mjs";

export class ComponentService {

    /**
     *
     * @param storageService {StorageUtil}
     */
    constructor(storageService) {
        this.storageService = storageService;
    }

    async getComponents(project, module) {
        try {
            const projectPath = this.storageService.getConfig(`${project}:projectPath`);
            const componentsDir = join(projectPath, 'modules', module, 'components');
            return promisify(readdir)(componentsDir);
        } catch (e) {
            return [];
        }
    }

    async getStates(project, module) {
        try {
            const projectPath = this.storageService.getConfig(`${project}:projectPath`);
            const componentsDir = join(projectPath, 'modules', module, 'states');
            return promisify(readdir)(componentsDir);
        } catch (e) {
            return [];
        }
    }

    async getStyles(project, module) {
        try {
            const projectPath = this.storageService.getConfig(`${project}:projectPath`);
            const componentsDir = join(projectPath, 'modules', module, 'styles');
            return promisify(readdir)(componentsDir);
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
     *     methods: Array<*>
     * }>}
     */
    async componentFileToJson(project, module, componentName) {
        if (componentName.toString().includes('.component.ts')) {
            componentName = componentName.toString().split('.')[0];
        }
        const projectPath = this.storageService.getConfig(`${project}:projectPath`);
        const componentFile = await promisify(readFile)(join(
            projectPath, 'modules', module, 'components', `${componentName}.component.ts`)
        );
        const componentJsonFile = {};
        componentJsonFile.name = componentName;
        componentJsonFile.injections = this._getStateInjectionsFromComponentFile(componentFile);
        componentJsonFile.styles = this._geStylesFromComponentFile(componentFile);
        componentJsonFile.template = this._getTemplateFromComponentFile(componentFile);
        // componentJsonFile.fields = this._getComponentFieldFromComponentFile(componentFile);
        componentJsonFile.methods = AppUtil.getMethodsFromFile(componentFile);
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
        const projectPath = this.storageService.getConfig(`${project}:projectPath`);
        const componentInjectionsWithType = component.injections
            .map(x => 'public readonly ' + x.name + ': ' + this._firstCaseUpper(x.state) + 'State')
            .join(',');
        //     const fields = component.fields.map(x => {
        //         return `
        // ${x.name}: any;`
        //     }).join('');
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
import {Component, EventEmitter, Input, OnInit, Output, OnDestroy} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
${this._getComponentImports(component.injections)}

@Component({
    selector: 'app-${component.name}',
    template: \`${component.template}\`,
    styleUrls: [${this._getComponentStylesFromJson(component.styles)}]
})
export class ${this._firstCaseUpper(component.name)}Component implements OnInit, OnDestroy{
    constructor(${componentInjectionsWithType}){
    }
    ${methods}
}

`);
        return 'done write component'
    }

    _getComponentImports(injections = []) {
        let im = '';
        for (const injection of injections) {
            const componentName = this._firstCaseUpper(injection.state)
            im += `import {${componentName}State} from '../states/${injection.state.toLowerCase()}.state';\n`
        }
        return im;
    }

    _getComponentStylesFromJson(styles = []) {
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

    _getStateInjectionsFromComponentFile(componentFile) {
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
                        state: x.split(':')[1] ? x.split(':')[1].replace('State', '').toLowerCase().trim() : ''
                    }
                });
        } else {
            return [];
        }
    }

    _getComponentFieldFromComponentFile(componentFile) {
        const reg = new RegExp('(\\w)+(:).*(\\;)', 'ig');
        const results = componentFile.toString().match(reg) ? componentFile.toString().match(reg) : [];
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
     * @param componentName - {string}
     */
    async createComponent(project, module, componentName) {
        componentName = componentName.toString().replace('.component.ts', '');
        const components = await this.getComponents(project, module);
        const exists = components.filter(x => x === componentName.toString().concat('.component.ts'));
        if (exists && Array.isArray(components) && exists.length > 0) {
            throw new Error('Component already exist');
        } else {
            return this.jsonToComponentFile({
                name: componentName,
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

    _geStylesFromComponentFile(componentFile) {
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

    _getTemplateFromComponentFile(componentFile) {
        const reg = new RegExp('template:.*((.|\\n)*)\\`', 'ig');
        const results = componentFile.toString().match(reg) ? componentFile.toString().match(reg)[0] : [];
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
