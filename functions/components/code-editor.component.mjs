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
                monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                    noSemanticValidation: true,
                    // noSyntaxValidation: false
                });
                monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                    target: monaco.languages.typescript.ScriptTarget.ES6,
                    allowNonTsExtensions: true
                });
                const libSource = "";
                const libUri = 'ts:filename/bfast.d.ts';
                monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri);
                // When resolving definitions and references, the editor will try to use created models.
                // Creating a model for the library allows "peek definition/references" commands to work with the library.
                monaco.editor.createModel(libSource, 'typescript', monaco.Uri.parse(libUri));
                editor = monaco.editor.create(document.getElementById('${id}'), {
                    value: ${JSON.stringify(codes)},
                    language: '${language}',
                    theme: 'vs-dark',
                    tabCompletion: 'on',
                    });
                document.getElementById('${saveButtonId}').setAttribute('style','display:block');
            });
        </script>
    `
}
