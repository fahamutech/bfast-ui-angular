import {errorMessageComponent} from "./error-message.component.mjs";
import {serviceInjectionTableComponent} from "./service-injection-table.component.mjs";
import {serviceMethodCreateForm} from "./service-method-form.component.mjs";
import {serviceMethodsListComponent} from "./service-methods-list.component.mjs";

/**
 *
 * @param project
 * @param module
 * @param service
 * @param error - {string} - error to show
 * @return {string} - template of service list
 */
export const serviceUpdateComponent = function (project, module, service, error = null) {
    return `
        <div style="margin-top: 24px" class="container col-xl-9 col-lg-9 col-sm-11 col-md-10 col-10">
            ${errorMessageComponent(error)}
            <div>
                <div>
                    <label>Service Name</label>
                    <input class="form-control" value="${service.name}" name="name" placeholder="enter service name" type="text">
                </div>
                ${serviceInjectionTableComponent(service)}
                ${serviceMethodCreateForm(project, module, service)}
                ${serviceMethodsListComponent(service)}
            </div>
        </div>
`
}

