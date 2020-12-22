import {errorMessageComponent} from "./error-message.component.mjs";
import {codeEditorComponent} from "./code-editor.component.mjs";

/**
 *
 * @param project
 * @param module
 * @param guard
 * @param styles
 * @param error - {string} - error to show
 * @return {string} - template of service list
 */
export const guardCreateComponent = async function (project, module, guard = {
    name: '',
    body: ''
}, styles = [], error = null) {
    return `
        <div style="margin-top: 24px" class="container col-xl-12 col-lg-12 col-sm-12 col-md-12 col-12">
            ${errorMessageComponent(error)}
            <div>
                <div>
                    <div class="d-flex lex-row" style="margin-bottom: 8px">
                        <h3>Guard Name</h3>
                        <span style="flex: 1 1 auto"></span>
<!--                        <button class="btn btn-sm btn-primary">Save Service</button>-->
                    </div>
                    <input class="form-control" readonly value="${guard.name}" name="name" placeholder="enter guard name" type="text">
                </div>
                <hr>
                <div class="d-flex align-items-center" style="margin-bottom: 8px">
                    <h3>Body</h3>
                    <span style="flex: 1 1 auto"></span>
                    <button style="display: none" id="updateStyleButton" class="btn btn-primary">Update</button>
                    <div style="display: none" id="saveProgress" class="spinner-border text-primary" role="status">
<!--                      <span class="visually-hidden">Loading...</span>-->
                    </div>
                </div>
                <div style="height: 70vh" id="styleCode"></div>
                <div>
                    ${codeEditorComponent('styleCode', guard.body, 'javascript', 'updateStyleButton', null)}
                </div>
                <script>
                    document.getElementById('updateStyleButton').onclick = ev => {
                        document.getElementById('saveProgress').setAttribute('style','display:block');
                        document.getElementById('updateStyleButton').setAttribute('style','display:none');
                        const code = editor.getValue();
                        fetch('/project/${project}/modules/${module}/resources/guards/${guard.name}', {
                            method: 'POST',
                            headers: {
                                'content-type': 'application/json'
                            },
                            body: JSON.stringify({
                                body: code,
                                name: '${guard.name}'
                            })
                        }).then(value => {
                           if (value.status !== 200) {
                               throw value.status + ' : ' + value.statusText.toString();
                           }else {
                               return value.json();
                           }
                        }).then(_=>{
                            // console.log(value);
                        }).catch(reason => {
                            console.log(reason);
                            alert(reason);
                        }).finally(() => {
                            document.getElementById('saveProgress').setAttribute('style','display:none');
                            document.getElementById('updateStyleButton').setAttribute('style','display:block');
                        });
                    }
                </script>
            </div>
        </div>
`
}

