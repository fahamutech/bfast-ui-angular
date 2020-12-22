import {readdir, readFile, writeFile} from 'fs';
import {join} from 'path';
import {promisify} from 'util';

export class GuardsService {

    /**
     *
     * @param storageService {StorageUtil}
     */
    constructor(storageService) {
        this.storageService = storageService;
    }

    async getGuards(project, module) {
        try {
            const projectPath = this.storageService.getConfig(`${project}:projectPath`);
            const guardsDir = join(projectPath, 'modules', module, 'guards');
            return promisify(readdir)(guardsDir);
        } catch (e) {
            return [];
        }
    }

    /**
     *
     * @param guard - {string} guard name
     * @param project - {string} current project
     * @param module - {string} current module
     * @return {Promise<void>}
     */
    async guardFileToJson(project, module, guard) {
        if (guard.toString().includes('.guard.ts')) {
            guard = guard.toString().split('.')[0];
        }
        const projectPath = this.storageService.getConfig(`${project}:projectPath`);
        const guardFile = await promisify(readFile)(join(projectPath, 'modules', module, 'guards', `${guard}.guard.ts`));
        const guardJsonFile = {};
        guardJsonFile.name = this._getGuardName(guardFile.toString());
        guardJsonFile.body = this._getGuardBody(guardFile.toString());
        guardJsonFile.injections = this._getInjectionsFromGuardFile(guardFile.toString());
        return guardJsonFile;
    }

    async getGuard(project, module, guard) {
        return this.guardFileToJson(project, module, guard);
    }

    /**
     *
     * @param guard - {{
     *     name: string,
     *     body: string,
     *     injections: {
     *         name: string,
     *         service: string
     *     }[]
     * }}
     * @param project - {string}
     * @param module - {string}
     * @return {Promise<any>}
     */
    async jsonToGuardFile(project, module, guard) {
        const projectPath = this.storageService.getConfig(`${project}:projectPath`);
        const serviceInjectionsWithType = guard.injections
            .map(x => 'private readonly ' + x.name + ': ' + this._firstCaseUpper(x.service) + 'Service')
            .join(',');
        await promisify(writeFile)(join(projectPath, 'modules', module, 'guards', `${guard.name}.guard.ts`),
            `import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
${this._getServiceImports(guard.injections)}

@Injectable({
  providedIn: 'any'
})
export class ${this._firstCaseUpper(guard.name)}Guard implements CanActivate {
    constructor(${serviceInjectionsWithType}){
    }
    
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        ${guard.body}
    }
}
`
        );
        return 'done write guard'
    }

    /**
     *
     * @param project - {string}
     * @param module - {string}
     * @param guard - {string}
     */
    async createGuard(project, module, guard) {
        guard = guard.toString().replace('.guard.ts', '');
        const guards = await this.getGuards(project, module);
        const exists = guards.filter(x => x === guard.toString().trim().concat('.guard.ts'));
        if (exists && Array.isArray(guards) && exists.length > 0) {
            throw new Error('Guard already exist');
        } else {
            return this.jsonToGuardFile(project, module, {name: guard, body: '', injections: []});
        }
    }

    /**
     *
     * @param project - {{
     *     name: string,
     *     body: string
     * }}
     * @param module - {string}
     * @param guard - {string}
     */
    async updateGuard(project, module, guard) {
        guard.name = guard.name.toString().replace('.guard.ts', '').toLowerCase().trim();
        return this.jsonToGuardFile(project, module, guard);
    }

    _getGuardName(guardFile) {
        // export class TestGuard implements CanActivate
        const reg = new RegExp('(export).*(class).*(\\{)', 'i');
        const result = guardFile.toString().match(reg);
        if (result && result[0]) {
            return result[0].toString()
                .replace('export', '')
                .replace('class', '')
                .replace('Guard', '')
                .replace('implements', '')
                .replace('CanActivate', '')
                .replace('{', '')
                .trim()
                .toLowerCase();
        } else {
            throw new Error('Fail to get guard name');
        }
    }

    _getGuardBody(guardFile) {
        guardFile = guardFile.toString();
        const reg = new RegExp('(canActivate).*(\\{)', 'gm');
        const result = guardFile.toString().match(reg);
        if (result && result[0]) {
            guardFile = guardFile.substring(guardFile.indexOf(result[0]), guardFile.lastIndexOf('}'));
            guardFile = guardFile.replace(result[0], '');
            return guardFile.substring(0, guardFile.lastIndexOf('}')).trim();
        } else {
            throw new Error('Fail to get guard body');
        }
    }

    _getInjectionsFromGuardFile(guardFile) {
        const reg = new RegExp('constructor\\(.*\\)');
        const results = guardFile.toString().match(reg) ? guardFile.toString().match(reg)[0] : [];
        if (results) {
            return results.toString()
                .replace(new RegExp('(constructor\\()*(private)*(readonly)*\\)*', 'gim'), '')
                .split(',')
                .filter(x => x !== '')
                .map(x => {
                    return {
                        name: x.split(':')[0] ? x.split(':')[0].trim() : '',
                        service: x.split(':')[1] ? x.split(':')[1].replace('Service', '').toLowerCase().trim() : ''
                    }
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

    _getServiceImports(injections = []) {
        let im = '';
        for (const injection of injections) {
            const serviceName = this._firstCaseUpper(injection.service)
            im += `import {${serviceName}Service} from '../services/${injection.service.toLowerCase()}.service';\n`
        }

        return im;
    }
}
