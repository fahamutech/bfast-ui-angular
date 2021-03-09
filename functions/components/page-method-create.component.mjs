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
 * @param page - {string}
 * @returns {string}
 */
export const pageMethodCreateComponent = function (project, module, page, method = {
    name: '',
    body: '',
    inputs: ''
}, error = null) {
    return (`
        <div style="margin-top: 24px;" class="container col-9 col-xl-9 col-lg-9 col-sm-11 col-md-10">
            ${errorMessageComponent(error)}
            <div class="d-flex lex-row" style="margin-bottom: 8px">
                <h3><a href="/project/${project}/modules/${module}/resources/pages/${page}" >${page} page</a> create method</h3>
                <span style="flex: 1 1 auto"></span>
<!--                        <button class="btn btn-sm btn-primary">Save Service</button>-->
            </div>
            <form id="methodCreateForm" class="form" action="/project/${project}/modules/${module}/resources/pages/${page}/method" method="post" enctype="application/json">
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
                    <div id="pageMethodEditor" class="code-editor"></div>
                    ${codeEditorComponent('pageMethodEditor', method.body ? method.body : '//your codes\n\n', 'javascript', 'saveServiceMethodButton')}
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
