import {errorMessageComponent} from "./error-message.component.mjs";
import {codeEditorComponent} from "./code-editor.component.mjs";

/**
 *
 * @param method - {{
 *     name: string,
 *     inputs: string,
 *     body: string,
 *     return: string
 * }}
 * @param error - {string}
 * @param project - {string} current project name
 * @param module - {string}
 * @param state - {string}
 * @returns {string}
 */
export const stateMethodCreateComponent = function (project, module, state, method = {
    name: '',
    body: '',
    inputs: ''
}, error = null) {
    return (`
        <div style="margin-top: 24px;" class="container col-9 col-xl-9 col-lg-9 col-sm-11 col-md-10">
            ${errorMessageComponent(error)}
            <form id="methodCreateForm" class="form" action="/project/${project}/modules/${module}/resources/states/${state}/method" method="post" enctype="application/json">
                <div class="form-group">
                    <label for="name" class="form-label">Name</label>
                    <input id="name" value="${method.name}" class="form-control" name="name" type="text" placeholder="method name">
                </div>
                <div class="form-group">
                    <label for="name" class="form-label">Inputs</label>
                    <input id="inputs" value="${method.inputs}" class="form-control" name="inputs" type="text" placeholder="method inputs">
                </div>
                <input id="codes" name="codes" type="hidden">
                <div class="form-group">
                    <div class="form-group" style="margin-top: 16px">
                        <button id="saveServiceMethodButton" class="btn btn-primary btn-block" style="display: none">Save Method</button>
                    </div>
                    <label for="detail" class="form-label">Method contents</label>
                    <div id="stateMethodEditor" style="height: 60vh"></div>
                    ${codeEditorComponent('stateMethodEditor', method.body ? method.body : '//your codes\n\n', 'javascript', 'saveServiceMethodButton')}
                </div>
            </form>
        </div>
        <script>
            document.getElementById('methodCreateForm').addEventListener('submit', ev => {
                ev.preventDefault();
                document.getElementById('codes').value = editor.getValue();
                if (!ev.target.name.value || ev.target.name.value === ''){
                    alert('Please enter method name');
                }else {
                    ev.target.submit();
                }
            });
        </script>
     `);
}
