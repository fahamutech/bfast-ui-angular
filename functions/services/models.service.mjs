import {readdir, readFile, writeFile} from 'fs';
import {join} from 'path';
import {promisify} from 'util';

export class ModelsService {

    /**
     *
     * @param storageService {StorageUtil}
     */
    constructor(storageService) {
        this.storageService = storageService;
    }

    async getModels(project, module) {
        try {
            const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
            const modelsDir = join(projectPath, 'modules', module, 'models');
            return promisify(readdir)(modelsDir);
        } catch (e) {
            return [];
        }
    }

    /**
     *
     * @param model - {string} model name
     * @param project - {string} current project
     * @param module - {string} current module
     * @return {Promise<void>}
     */
    async modelFileToJson(project, module, model) {
        if (model.toString().includes('.model.ts')) {
            model = model.toString().split('.')[0];
        }
        const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
        const modelFile = await promisify(readFile)(join(projectPath, 'modules', module, 'models', `${model}.model.ts`));
        const modelJsonFile = {};
        modelJsonFile.name = this._getModelName(modelFile);
        modelJsonFile.body = this._getModelBody(modelFile);
        return modelJsonFile;
    }

    async getModel(project, module, model) {
        return this.modelFileToJson(project, module, model);
    }

    /**
     *
     * @param model - {{
     *     name: string,
     *     body: string
     * }}
     * @param project - {string}
     * @param module - {string}
     * @return {Promise<any>}
     */
    async jsonToModelFile(project, module, model) {
        const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
        await promisify(writeFile)(join(projectPath, 'modules', module, 'models', `${model.name}.model.ts`),
            `
export interface ${model.name}Model {
    ${model.body}
}
            `
        );
        return 'done write model'
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param model - {string}
     */
    async createModel(project, module, model) {
        model = model.toString().replace('.model.ts', '');
        const models = await this.getModels(project, module);
        const exists = models.filter(x => x === model.toString().trim().concat('.model.ts'));
        if (exists && Array.isArray(models) && exists.length > 0) {
            throw new Error('Model already exist');
        } else {
            return this.jsonToModelFile(project, module, {name: model, body: ''});
        }
    }

    /**
     *
     * @param project - {{
     *     name: string,
     *     body: string
     * }}
     * @param module - {string}
     * @param model - {string}
     */
    async updateModel(project, module, model) {
        model.name = model.name.toString().replace('.model.ts', '').trim();
        return this.jsonToModelFile(project, module, model);
    }

    _getModelName(modelFile) {
        const reg = new RegExp('(export).*\\{', 'i');
        const result = modelFile.toString().match(reg);
        if (result && result[0]) {
            return result[0].toString()
                .replace('export', '')
                .replace('interface', '')
                .replace('Model', '')
                .replace('{', '')
                .trim();
        } else {
            throw new Error('Fail to get model name');
        }
    }

    _getModelBody(modelFile) {
        const reg = new RegExp('(export).*\\{', 'i');
        const result = modelFile.toString().match(reg);
        if (result && result[0]) {
            modelFile = modelFile.toString().replace(result[0].toString(), '').trim();
            return modelFile.substring(0, modelFile.lastIndexOf('}'));
        } else {
            throw new Error('Fail to get model body');
        }
    }
}
