import {errorMessageComponent} from "./error-message.component.mjs";
import {componentInjectionTableComponent} from "./component-injection-table.component.mjs";
import {componentMethodsListComponent} from "./component-methods-list.component.mjs";
import {componentStyleTableComponent} from "./component-styles-table.component.mjs";

/**
 *
 * @param project
 * @param module
 * @param component
 * @param states
 * @param styles
 * @param error - {string} - error to show
 * @return {string} - template of component list
 */
export const componentCreateComponent = async function (project, module, component = {
    name: '',
    injections: [],
    fields: [],
    methods: []
}, states = [], styles = [], error = null) {
    return `
        <div style="margin-top: 24px" class="container col-xl-12 col-lg-12 col-sm-12 col-md-12 col-12">
            ${errorMessageComponent(error)}
            <div>
                <div>
                    <div class="d-flex lex-row" style="margin-bottom: 8px">
                        <h3>Name</h3>
                        <span style="flex: 1 1 auto"></span>
                        <a href="/project/${project}/modules/${module}/resources/components/${component.name}/template">
                            <button class="btn btn-sm btn-primary">Update Template</button>
                        </a>
                    </div>
                    <input class="form-control" disabled value="${component.name}" name="name" placeholder="enter component name" type="text">
                </div>
                <hr>
                ${await componentInjectionTableComponent(project, module, component.name, component.injections ? component.injections : [], states)}
                ${await componentStyleTableComponent(project, module, component.name, component.styles ? component.styles : [], styles)}
                ${componentMethodsListComponent(project, module, component.name, component.methods ? component.methods : [])}
            </div>
        </div>
`
}
