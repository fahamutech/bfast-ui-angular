const nconf = require('nconf')

class StorageUtil {
    /**
     *
     * @param identifier - {string}
     */
    getConfig(identifier) {
        nconf.use('file', {file: `${__dirname}/storage.json`});
        nconf.load();
        return nconf.get(identifier);
    }

    /**
     *
     * @param identifier - {string}
     * @param data - {string | number | {[key: string]: any}}
     */
    setConfig(identifier, data) {
        nconf.use('file', {file: `${__dirname}/storage.json`});
        nconf.load();
        nconf.set(identifier, data);
        nconf.save();
        return data;
    }
}

module.exports = {
    StorageUtil: StorageUtil
}
