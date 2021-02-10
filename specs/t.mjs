import BFastUiAngular from "../bfast-ui-angular.mjs";

new BFastUiAngular().init().then(value => {
    return value.ide.start();
}).then(reason => {
    console.log('start successful');
}).catch(reason => {
    console.log(reason);
})
