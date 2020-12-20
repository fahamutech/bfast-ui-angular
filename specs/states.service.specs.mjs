import {StateService} from '../functions/services/state.service.mjs'
import {StorageUtil} from './mocks/storage.util.mjs'

describe('State Service Unit Test', function () {
    let service

    before(function () {
        service = new StateService(new StorageUtil());
    })

    it('should write a state file from json', async function () {
        const result = await service.jsonToStateFile({
            name: 'test',
            states: [
                {
                    name: 'members',
                    service: 'members',
                    type: 'BehaviorSubject'
                },
                {
                    name: 'members2',
                    service: 'members2',
                    type: 'BehaviorSubject'
                }
            ],
            injections: [
                {
                    name: 'storageService',
                    service: 'storage'
                },
                {
                    name: 'storageService2',
                    service: 'storagaaa'
                }
            ],
            methods: [
                {
                    name: 'getName',
                    inputs: 'age: number, date: any',
                    return: 'any',
                    body: `// your codes`
                },
                {
                    name: 'getName2',
                    inputs: 'age: number, date: any',
                    return: 'any',
                    body: `// your codes`
                }
            ]
        }, 'test', 'test');
        // .then(value => {
        // console.log(result);
        // }).catch(reason => {
        //     console(reason);
        // });

    });

    it('should read state file to json', async function () {
        const result = await service.stateFileToJson('test', 'test', 'test');
        console.log(result);
    });
});
