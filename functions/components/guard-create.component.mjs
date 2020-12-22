import {errorMessageComponent} from "./error-message.component.mjs";
import {codeEditorComponent} from "./code-editor.component.mjs";
import {guardInjectionTableComponent} from "./guard-injection-table.component.mjs";
import {serviceMethodsListComponent} from "./service-methods-list.component.mjs";
import {guardMethodsListComponent} from "./guard-methods-list.component.mjs";

/**
 *
 * @param project
 * @param module
 * @param guard
 * @param services
 * @param error - {string} - error to show
 * @return {string} - template of service list
 */
export const guardCreateComponent = async function (project, module, guard = {
    name: '',
    body: ''
}, services = [], error = null) {
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
                ${await guardInjectionTableComponent(project, module, guard.name, guard.injections ? guard.injections : [], services)}
                ${guardMethodsListComponent(project, module, guard.name, guard.body)}
            </div>
        </div>
`
}

