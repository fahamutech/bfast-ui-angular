import {errorMessageComponent} from "./error-message.component.mjs";
import {stateInjectionTableComponent} from "./state-injection-table.component.mjs";
import {stateMethodsListComponent} from "./state-methods-list.component.mjs";
import {stateFieldsTableComponent} from "./state-fields-table.component.mjs";

/**
 *
 * @param project
 * @param module
 * @param state
 * @param services
 * @param error - {string} - error to show
 * @return {string} - template of state list
 */
export const stateCreateComponent = async function (project, module, state = {
    name: '',
    injections: [],
    methods: []
}, services = [], error = null) {
    return `
        <div style="margin-top: 24px" class="container col-xl-9 col-lg-9 col-sm-12 col-md-11 col-12">
            ${errorMessageComponent(error)}
            <div>
                <div>
                    <div class="d-flex lex-row" style="margin-bottom: 8px">
                        <h3>Name</h3>
                        <span style="flex: 1 1 auto"></span>
<!--                        <button class="btn btn-sm btn-primary">Save Service</button>-->
                    </div>
                    <input class="form-control" disabled value="${state.name}" name="name" placeholder="enter state name" type="text">
                </div>
                <hr>
                ${await stateInjectionTableComponent(project, module, state.name, state.injections ? state.injections : [], services)}
                ${await stateFieldsTableComponent(project, module, state.name, state.states ? state.states : [])}
                ${stateMethodsListComponent(project, module, state.name, state.methods ? state.methods : [])}
            </div>
        </div>
`
}

