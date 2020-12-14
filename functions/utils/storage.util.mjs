import nconf from 'nconf'
import * as path from "path";

export class StorageUtil {
    /**
     *
     * @param identifier - {string}
     */

    __dirname = path.resolve('functions', 'utils');

    getConfig(identifier) {
        nconf.use('file', {file: `${this.__dirname}/storage.json`});
        nconf.load();
        return nconf.get(identifier);
    }

    /**
     *
     * @param identifier - {string}
     * @param data - {string | number | {[key: string]: any}}
     */
    setConfig(identifier, data) {
        nconf.use('file', {file: `${this.__dirname}/storage.json`});
        nconf.load();
        nconf.set(identifier, data);
        nconf.save();
        return data;
    }
}
