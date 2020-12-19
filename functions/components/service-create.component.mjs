import {errorMessageComponent} from "./error-message.component.mjs";
import {serviceInjectionTableComponent} from "./service-injection-table.component.mjs";
import {serviceMethodsListComponent} from "./service-methods-list.component.mjs";

/**
 *
 * @param project
 * @param module
 * @param serviceInJson
 * @param error - {string} - error to show
 * @return {string} - template of service list
 */
export const serviceCreateComponent = async function (project, module, service = {
    name: '',
    injections: [],
    methods: []
}, services = [], error = null) {
    return `
        <div style="margin-top: 24px" class="container col-xl-12 col-lg-12 col-sm-12 col-md-12 col-12">
            ${errorMessageComponent(error)}
            <div>
                <div>
                    <div class="d-flex lex-row" style="margin-bottom: 8px">
                        <h3>Service Name</h3>
                        <span style="flex: 1 1 auto"></span>
<!--                        <button class="btn btn-sm btn-primary">Save Service</button>-->
                    </div>
                    <input class="form-control" disabled value="${service.name}" name="name" placeholder="enter service name" type="text">
                </div>
                <hr>
                ${await serviceInjectionTableComponent(project, module, service.name, service.injections ? service.injections : [], services)}
                ${serviceMethodsListComponent(project, module, service.name, service.methods ? service.methods : [])}
            </div>
        </div>
`
}

