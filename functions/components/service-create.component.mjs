import {errorMessageComponent} from "./error-message.component.mjs";
import {serviceInjectionTableComponent} from "./service-injection-table.component.mjs";
import {serviceMethodCreateForm} from "./service-method-form.component.mjs";
import {serviceMethodsListComponent} from "./service-methods-list.component.mjs";

/**
 *
 * @param project
 * @param module
 * @param error - {string} - error to show
 * @return {string} - template of service list
 */
export const serviceCreateComponent = function (project, module, error = null) {
    return `
        <div style="margin-top: 24px" class="container col-xl-9 col-lg-9 col-sm-11 col-md-10 col-10">
            ${errorMessageComponent(error)}
            <div>
                ${serviceInjectionTableComponent()}
                ${serviceMethodCreateForm(project, module)}
                ${serviceMethodsListComponent()}
            </div>
        </div>
`
}

