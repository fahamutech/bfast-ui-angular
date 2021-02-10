import {BfastFunctions} from 'bfast-function';
import {join, resolve} from 'path';
import getPort from 'get-port';

const __dirname = resolve('.');
getPort({}).then(async port => {
    return {
        server: await new BfastFunctions({
            port: port,
            functionsConfig: {
                bfastJsonPath: join(__dirname, 'bfast.json'),
                functionsDirPath: join(__dirname, 'functions')
            }
        }).start(),
        port: port
    }
}).then(_ => {
    console.log('open http://localhost:' + _.port);
}).catch(reason => {
    console.log(reason);
    process.exit(-1);
})
