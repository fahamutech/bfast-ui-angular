import bfastnode from 'bfastnode';

export const bfastUiHome = bfastnode.bfast.functions().onHttpRequest(
    '/',
    (request, response) => {
        response.json({message: 'Welcome to Bfast Ui'})
    }
);
