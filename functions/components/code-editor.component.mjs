/**
 *
 * @param id - {string}
 * @param codes - {any}
 * @param language - {string}
 * @param saveButtonId - {string}
 * @param submit - {function}
 * @return {string}
 */
export const codeEditorComponent = function (id, codes, language = 'typescript', saveButtonId, submit) {
    return `
        <script src="/assets/editor/min/vs/loader.js"></script>
        <script>
            require.config({ paths: { vs: '/assets/editor/min/vs' } });
            let  editor;
            require(['vs/editor/editor.main'], function () {
            editor = monaco.editor.create(document.getElementById('${id}'), {
                value: ${JSON.stringify(codes)},
                language: '${language}',
                theme: 'vs-dark'
                });
             document.getElementById('${saveButtonId}').setAttribute('style','display:block');
            });
        </script>
    `
}
