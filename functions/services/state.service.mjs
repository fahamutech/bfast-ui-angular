import {readdir, readFile, writeFile} from 'fs';
import {join} from 'path';
import {promisify} from 'util';
import {AppUtil} from "../utils/app.util.mjs";

export class StateService {

    /**
     *
     * @param storageService {StorageUtil}
     * @param appUtil {AppUtil}
     */
    constructor(storageService, appUtil) {
        this.storageService = storageService;
        this.appUtil = appUtil;
    }

    async getStates(project, module) {
        try {
            const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
            const statesDir = join(projectPath, 'modules', module, 'states');
            return promisify(readdir)(statesDir);
        } catch (e) {
            return [];
        }
    }

    async getServices(project, module) {
        try {
            const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
            const statesDir = join(projectPath, 'modules', module, 'services');
            return promisify(readdir)(statesDir);
        } catch (e) {
            return [];
        }
    }

    /**
     *
     * @param stateName {string} state name
     * @param project {string} current project
     * @param module {string} current module
     * @return {Promise<{
     *     methods: Array<*>,
     *     name: string,
     *     injections: Array<*>,
     *     states: Array<*>
     * }>}
     */
    async stateFileToJson(stateName, project, module) {
        stateName = stateName.toString().replace('.state.ts', '');
        const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
        const stateFile = await promisify(readFile)(join(projectPath, 'modules', module, 'states', `${stateName}.state.ts`));
        const stateJsonFile = {};
        stateJsonFile.name = stateName;
        stateJsonFile.injections = this.appUtil.getInjectionsFromFile(stateFile);
        stateJsonFile.states = this.getStateFieldFromStateFile(stateFile);
        stateJsonFile.methods = this.appUtil.getMethodsFromFile(stateFile);
        return stateJsonFile;
    }

    async getState(project, module, state) {
        return this.stateFileToJson(state, project, module);
    }

    /**
     *
     * @param state - {{
     *     name: string,
     *     injections: {
     *         name: string,
     *         state: string
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
    async jsonToStateFile(state, project, module) {
        const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
        const stateInjectionsWithType = state.injections.map(x => 'private readonly '
            + this.appUtil.firstCaseLower(this.appUtil.kebalCaseToCamelCase(x.name))
            + ': '
            + this.appUtil.firstCaseUpper(this.appUtil.kebalCaseToCamelCase(x.service))
            + 'Service'
        ).join(',');
        const states = state.states.map(x => {
            return `
    ${x.name}: BehaviorSubject<any> = new BehaviorSubject<any>(null);`
        }).join('');
        const methods = state.methods.map(x => {
            return `
    async ${x.name}(${x.inputs}): Promise<any> {
        ${x.body.toString().trim()}
    }`
        }).join('\n');

        await promisify(writeFile)(join(projectPath, 'modules', module, 'states', `${state.name}.state.ts`),
            `import {bfast, BFast} from 'bfastjs';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
${this.getStateImports(state.injections)}

@Injectable({
    providedIn: 'any'
})
export class ${this.appUtil.firstCaseUpper(this.appUtil.kebalCaseToCamelCase(state.name))}State {
    constructor(${stateInjectionsWithType}){
    }
    ${states}
    ${methods}
}

`);
        return 'done write state'
    }

    getStateImports(injections = []) {
        let im = '';
        for (const injection of injections) {
            const stateName = this.appUtil.firstCaseUpper(this.appUtil.kebalCaseToCamelCase(injection.service))
            im += `import {${stateName}Service} from '../services/${injection.service}.service';\n`
        }

        return im;
    }

    // _getMethodsFromStateFile(stateFile) {
    //     const reg = new RegExp(`(async)+.*`, 'gim');
    //     const results = stateFile.toString().match(reg) ? stateFile.toString().match(reg) : [];
    //     const indexes = results.map(x => {
    //         return stateFile.toString().indexOf(x);
    //     }).filter(x => x > 0);
    //     const methods = indexes.map((value, index, array) => {
    //         if (index === indexes.length - 1) {
    //             let closingTag = stateFile.toString().lastIndexOf("}");
    //             return stateFile.toString().substring(value, closingTag);
    //         }
    //         return stateFile.toString().substring(value, indexes[index + 1]);
    //     });
    //     if (methods) {
    //         return methods.map(x => {
    //             const inputsMatch = x.toString().trim().match(new RegExp("\\(.*\\)"));
    //             let inputs = inputsMatch ? inputsMatch.toString() : '';
    //             inputs = inputs.substring(1, inputs.length - 1)
    //             let methodBody = x.toString().replace(new RegExp('(async)+.*', 'gim'), '').trim();
    //             methodBody = methodBody.substring(0, methodBody.lastIndexOf('}'));
    //             return {
    //                 name: x.toString().trim().match(new RegExp('^[\\w\\d\\s]*')).toString().replace("async", "").trim(),
    //                 inputs: inputs.trim(),
    //                 return: "void",
    //                 body: methodBody
    //             }
    //         });
    //     } else {
    //         return [];
    //     }
    // }

    getStateFieldFromStateFile(stateFile) {
        const reg = new RegExp('(\\w)+(:).*(\\;)', 'ig');
        const results = stateFile.toString().match(reg) ? stateFile.toString().match(reg) : [];
        if (results) {
            return results.map(x => x.toString().split(':')[0])
                // .replace(new RegExp('(:){1}.*(\\;){1}', 'gim'), '')
                .filter(x => x !== '')
                .map(x => {
                    return {
                        name: x.trim(),
                        state: x.trim(),
                        type: 'BehaviorSubject'
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
     * @param stateName - {string}
     */
    async createState(project, module, stateName) {
        stateName = this.appUtil.camelCaseToKebal(stateName.toString().replace('.state.ts', ''));
        stateName = stateName.replace(new RegExp('[^A-Za-z0-9-]*', 'ig'), '');
        stateName = stateName.replace(new RegExp('([-]{2,})', 'ig'), '-');
        if (stateName && stateName === '') {
            throw new Error('State must be alphanumeric');
        }
        const states = await this.getStates(project, module);
        const exists = states.filter(x => x === stateName.toString().concat('.state.ts'));
        if (exists && Array.isArray(states) && exists.length > 0) {
            throw new Error('State already exist');
        } else {
            return this.jsonToStateFile({name: stateName, states: [], injections: [], methods: []}, project, module);
        }
    }

    /**
     *
     * @param project {string}
     * @param module  {string}
     * @param state  {string}
     * @param method  {{
     *     name: string,
     *     inputs: string,
     *     return: string,
     *     body: string
     * }}
     * @return {Promise<void>}
     */
    async addMethod(project, module, state, method) {
        state = state.toString();
        const stateJson = await this.stateFileToJson(state, project, module);
        const exists = stateJson.methods.filter(x => x.name === method.name.toString());
        if (exists && Array.isArray(exists) && exists.length > 0) {
            throw new Error('State method already exist');
        } else {
            stateJson.methods.push(method);
            return this.jsonToStateFile(stateJson, project, module);
        }
    }

    /**
     *
     * @param project  {string}
     * @param module  {string}
     * @param state  {string}
     * @param method  {string}
     * @return {Promise<any>}
     */
    async getMethod(project, module, state, method) {
        const stateJson = await this.stateFileToJson(state, project, module);
        const exists = stateJson.methods.filter(x => x.name === method.toString());
        if (exists && Array.isArray(exists) && exists.length > 0) {
            return exists[0];
        } else {
            throw new Error('State method does not exist');
        }
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param state - {string}
     * @param method - {string}
     * @param update - {{
     *     name: string,
     *     inputs: string,
     *     body: string,
     *     return: string
     * }}
     * @return {Promise<any>}
     */
    async updateMethod(project, module, state, method, update) {
        const stateJson = await this.stateFileToJson(state, project, module);
        stateJson.methods = stateJson.methods.map(x => {
            if (x.name === method.toString()) {
                return update;
            } else {
                return x;
            }
        });
        return this.jsonToStateFile(stateJson, project, module);
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param state - {string}
     * @param method - {string}
     * @return {Promise<any>}
     */
    async deleteMethod(project, module, state, method) {
        const stateJson = await this.stateFileToJson(state, project, module);
        stateJson.methods = stateJson.methods.filter(x => x.name !== method.toString());
        return this.jsonToStateFile(stateJson, project, module);
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param state - {string} current state which want injection
     * @return {Promise<*>}
     */
    async getInjections(project, module, state) {
        const allStates = await this.getStates(project, module);
        return allStates.filter(x => x !== state);
    }

}
