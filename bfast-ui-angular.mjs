import {BfastFunctions} from 'bfast-function';
import {join, resolve} from 'path';
import getPort from 'get-port';

export class BFastUiAngular {

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

export default BFastUiAngular;