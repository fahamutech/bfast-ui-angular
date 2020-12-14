import {ServicesService} from '../functions/services/services.service.mjs'
import {StorageUtil} from './mocks/storage.util.mjs'

describe('Services Service Unit Test', function () {
    let service

    before(function () {
        service = new ServicesService(new StorageUtil());
    })

    it('should write a service file from json', async function () {
        const result = await service.jsonToFile({
            name: 'test',
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
                    body: `bfast.cache();
                     if(age | date){

        }
        console.log(age);
        console.log(date);
        return 34`
                },

                {
                    name: 'getName2',
                    inputs: 'age: number, date: any',
                    return: 'any',
                    body:
                        `console.log(age);
        console.log(date);
        return 31`
                }
            ]
        }, 'test', 'test');
        // .then(value => {
        console.log(result);
        // }).catch(reason => {
        //     console(reason);
        // });

    });

    it('should read service file to json', async function () {
        const result = await service.serviceFileToJson('test', 'test', 'test');
    });
});
