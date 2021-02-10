const {BfastFunctions} = require('bfast-function');
const {join} = require('path');
const getPort = require('get-port');

class BfastUiAngular {

    /**
     *
     * @return {Promise<{ide: BfastFunctions, port: number}>}
     */
    async init() {
        return getPort({port: 4000}).then(async port => {
            return {
                ide: await new BfastFunctions({
                    port: port,
                    functionsConfig: {
                        bfastJsonPath: join(__dirname, 'bfast.json'),
                        functionsDirPath: join(__dirname, 'functions'),
                        assets: join(__dirname, 'assets')
                    }
                }),
                port: port
            }
        });
    }
}

module.exports = {
    BfastUiAngular: BfastUiAngular
};
