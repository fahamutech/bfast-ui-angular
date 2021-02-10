const {BfastFunctions} = require('bfast-function');
const {join, resolve} = require('path');
const getPort = require('get-port');

class BfastUiAngularCommon {

    /**
     *
     * @return {Promise<{ide: BfastFunctions, port: number}>}
     */
    async init() {
        const __dirname = resolve('.');
        return getPort({port: 4000}).then(async port => {
            return {
                ide: await new BfastFunctions({
                    port: port,
                    functionsConfig: {
                        bfastJsonPath: join(__dirname, 'bfast.json'),
                        functionsDirPath: join(__dirname, 'functions')
                    }
                }),
                port: port
            }
        });
    }
}

module.exports = {
    BfastUiAngular: BfastUiAngularCommon
};
