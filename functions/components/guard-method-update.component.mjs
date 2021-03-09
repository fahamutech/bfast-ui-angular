import {errorMessageComponent} from "./error-message.component.mjs";
import {codeEditorComponent} from "./code-editor.component.mjs";

/**
 *
 * @param guard - {{
 *     name: string,
 *     inputs: string,
 *     body: string,
 *     return: string
 * }}
 * @param error - {string}
 * @param project - {string} current project name
 * @param module - {string}
 * @param guard - {{
 *     name: string,
 *     body: string,
 *     injections: Array<string>
 * }}
 * @returns {string}
 */
export const guardMethodUpdateComponent = function (project, module, guard = {
    name: '',
    body: '',
    injections: []
}, error = null) {
    return (`
        <div style="margin-top: 24px;" class="container col-9 col-xl-9 col-lg-9 col-sm-11 col-md-10">
            ${errorMessageComponent(error)}
            <div class="d-flex lex-row" style="margin-bottom: 8px">
                <h3><a href="/project/${project}/modules/${module}/resources/guards/${guard.name}" >${guard.name} guard</a> update method</h3>
                <span style="flex: 1 1 auto"></span>
<!--                        <button class="btn btn-sm btn-primary">Save Service</button>-->
            </div>
            <hr>
            <form id="methodUpdateForm" class="form" action="/project/${project}/modules/${module}/resources/guards/${guard.name}/method/canActivate" method="post">
                <div class="form-group">
                    <label for="name" class="form-label">Name</label>
                    <input id="name" readonly value="${guard.name}" class="form-control" name="name" type="text" placeholder="method name">
                </div>
                <input id="codes" name="body" type="hidden">
                <div class="form-group">
                    <div class="form-group" style="margin-top: 16px">
                        <button id="saveServiceMethodButton" class="btn btn-primary btn-block" style="display: none">Update Method</button>
                    </div>
                    <label for="detail" class="form-label">Method contents</label>
                    <div id="serviceMethodEditor" class="code-editor"></div>
                    ${codeEditorComponent('serviceMethodEditor', guard.body ? guard.body : '//your codes\n\n', 'javascript', 'saveServiceMethodButton')}
                </div>
            </form>
        </div>
        <script>
            document.getElementById('methodUpdateForm').addEventListener('submit', ev => {
                ev.preventDefault();
                document.getElementById('codes').value = editor.getValue();
                // console.log(ev.target.name.value);
                if (!ev.target.name.value || ev.target.name.value === ''){
                    alert('Please enter method name');
                }else {
                   ev.target.submit();
                }
            });
        </script>
     `);
}
