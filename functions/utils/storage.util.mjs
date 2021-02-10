import nconf from 'nconf'
import {join} from "path";
import {homedir} from 'os';
import {mkdir, stat, writeFile} from 'fs';
import {promisify} from 'util';

export class StorageUtil {
    /**
     *
     * @param identifier - {string}
     */

    __dirname = join(homedir(), 'bfast-ui');
    storageFile = `${this.__dirname}/storage.json`

    async getConfig(identifier) {
        await this.checkStorageExist();
        nconf.use('file', {file: this.storageFile});
        nconf.load();
        return nconf.get(identifier);
    }

    /**
     *
     * @param identifier - {string}
     * @param data - {string | number | {[key: string]: any}}
     */
    async setConfig(identifier, data) {
        await this.checkStorageExist();
        nconf.use('file', {file: this.storageFile});
        nconf.load();
        nconf.set(identifier, data);
        nconf.save();
        return data;
    }

    /**
     *
     * @param identifier - {string}
     */
    async removeConfig(identifier) {
        await this.checkStorageExist();
        nconf.use('file', {file: this.storageFile});
        nconf.load();
        nconf.set(identifier, undefined);
        nconf.save();
    }

    async checkStorageExist() {
        try {
            await promisify(stat)(this.storageFile);
            return 'done';
        } catch (e) {
            console.log('no storage file create now');
            await promisify(mkdir)(this.__dirname);
            await promisify(writeFile)(this.storageFile, JSON.stringify({}));
            return 'done';
        }
    }
}
