import {readdir, readFile, writeFile} from 'fs';
import {join} from 'path';
import {promisify} from 'util';

export class StylesService {

    /**
     *
     * @param storageService {StorageUtil}
     * @param appUtil {AppUtil}
     */
    constructor(storageService, appUtil) {
        this.storageService = storageService;
        this.appUtil = appUtil;
    }

    async getStyles(project, module) {
        try {
            const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
            const servicesDir = join(projectPath, 'modules', module, 'styles');
            return promisify(readdir)(servicesDir);
        } catch (e) {
            return [];
        }
    }

    /**
     *
     * @param style - {string} service name
     * @param project - {string} current project
     * @param module - {string} current module
     * @return {Promise<void>}
     */
    async styleFileToJson(project, module, style) {
        if (style.toString().includes('.style.scss')) {
            style = style.toString().split('.')[0];
        }
        const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
        const styleFile = await promisify(readFile)(join(projectPath, 'modules', module, 'styles', `${style}.style.scss`));
        const styleJsonFile = {};
        styleJsonFile.name = style;
        styleJsonFile.body = styleFile.toString()
        return styleJsonFile;
    }

    async getStyle(project, module, style) {
        return this.styleFileToJson(project, module, style);
    }

    /**
     *
     * @param style - {{
     *     name: string,
     *     body: string
     * }}
     * @param project - {string}
     * @param module - {string}
     * @return {Promise<any>}
     */
    async jsonToStyleFile(project, module, style) {
        const projectPath = await this.storageService.getConfig(`${project}:projectPath`);
        await promisify(writeFile)(join(projectPath, 'modules', module, 'styles', `${style.name}.style.scss`), style.body);
        return 'done write style'
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param style - {string}
     */
    async createStyle(project, module, style) {
        // style = style.toString().replace('.style.scss', '');
        style = this.appUtil.firstCaseLower(this.appUtil.kebalCaseToCamelCase(style.toString().replace('.style.scss', '')));
        style = style.replace(new RegExp('[^A-Za-z0-9]*', 'ig'), '');
        if (style && style === '') {
            throw new Error('Style must be alphanumeric');
        }
        const styles = await this.getStyles(project, module);
        const exists = styles.filter(x => x === style.toString().trim().concat('.style.scss'));
        if (exists && Array.isArray(styles) && exists.length > 0) {
            throw new Error('Style already exist');
        } else {
            return this.jsonToStyleFile(project, module, {name: style, body: ''});
        }
    }

    /**
     *
     * @param project - {{
     *     name: string,
     *     body: string
     * }}
     * @param module - {string}
     * @param style - {string}
     */
    async updateStyle(project, module, style) {
        style.name = style.name.toString().replace('.style.scss', '').trim();
        return this.jsonToStyleFile(project, module, style);
    }

}
