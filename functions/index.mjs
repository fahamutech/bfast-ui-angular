import bfastnode from 'bfastnode';

const {bfast} = bfastnode;

export const bfastUiHome = bfast.functions().onHttpRequest(
    '/',
    (request, response) => {
        response.redirect('/project');
    }
);
