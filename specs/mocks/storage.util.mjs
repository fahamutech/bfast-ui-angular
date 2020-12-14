import * as path from "path";

export class StorageUtil {
    /**
     *
     * @param identifier - {string}
     */

    __dirname = path.resolve('functions', 'utils');

    getConfig(identifier) {
        return path.resolve('specs', "mocks");
    }

    /**
     *
     * @param identifier - {string}
     * @param data - {string | number | {[key: string]: any}}
     */
    setConfig(identifier, data) {
        return data;
    }
}
