const {BFast} = require('bfastnode');

exports.helloWorld = BFast.functions().onHttpRequest(
    '/',
    (request, response) => {
        response.json({message: 'Welcome to Bfast Ui'})
    }
);
