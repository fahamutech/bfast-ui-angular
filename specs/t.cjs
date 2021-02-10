const {BfastUiAngular} = require("../bfast-ui-angular.common");

new BfastUiAngular().init().then(value => {
    return value.ide.start();
}).then(_ => {
    console.log('start successful');
}).catch(reason => {
    console.log(reason);
});
