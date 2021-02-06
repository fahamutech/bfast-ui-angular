import {errorMessageComponent} from "./error-message.component.mjs";
import {codeEditorComponent} from "./code-editor.component.mjs";

/**
 *
 *     name: string,
 *     inputs: string,
 *     body: string,
 *     return: string
 * }}
 * @param body
 * @param error - {string}
 * @param project - {string} current project name
 * @param module - {string}
 *     name: string,
 *     body: string,
 *     injections: Array<string>
 * }}
 * @returns {string}
 */
export const moduleConstructorUpdateComponent = function (project, module, body, error = null) {
    return (`
        <div style="margin-top: 24px;" class="container col-9 col-xl-9 col-lg-9 col-sm-11 col-md-10">
            ${errorMessageComponent(error)}
            <h2>${module} module constructor body</h2>
            <hr>
            <form id="methodUpdateForm" class="form" action="/project/${project}/modules/${module}/resources/constructor" method="post">
<!--                <div class="form-group">-->
<!--                    <label for="name" class="form-label">Name</label>-->
<!--                    <input id="name" readonly value="" class="form-control" name="name" type="text" placeholder="method name">-->
<!--                </div>-->
                <input id="codes" name="body" type="hidden">
                <div class="form-group">
                    <div class="form-group" style="margin-top: 16px">
                        <button id="saveServiceMethodButton" class="btn btn-primary btn-block" style="display: none">Update Constructor</button>
                    </div>
                    <label for="detail" class="form-label">Codes</label>
                    <div id="serviceMethodEditor" style="height: 80vh"></div>
                    ${codeEditorComponent('serviceMethodEditor', body ? body : '//your codes\n\n', 'javascript', 'saveServiceMethodButton')}
                </div>
            </form>
        </div>
        <script>
            document.getElementById('methodUpdateForm').addEventListener('submit', ev => {
                ev.preventDefault();
                document.getElementById('codes').value = editor.getValue();
                   ev.preventDefault();
                   fetch(location.href,{
                       method: 'POST',
                       headers: {
                           'content-type': 'application/json'
                       },
                       body: JSON.stringify({body: editor.getValue()})
                   }).then(value => {
                      // console.log(value);
                       if (value.status === 200){
                           return  value.json();
                       }else {
                           throw value.json();
                       }
                   }).then(value1 => {
                       alert(value1 && value1.message?value1.message: 'Constructor Updated, Successful')
                   }).catch(async reason => {
                       reason = await reason;
                       alert(reason && reason.message?reason.message: reason);
                   });
            });
        </script>
     `);
}
