import {errorMessageComponent} from "./error-message.component.mjs";
import {pageInjectionTableComponent} from "./page-injection-table.component.mjs";
import {pageMethodsListComponent} from "./page-methods-list.component.mjs";
import {pageStyleTableComponent} from "./page-styles-table.component.mjs";

/**
 *
 * @param project
 * @param module
 * @param page
 * @param states
 * @param styles
 * @param error - {string} - error to show
 * @return {string} - template of page list
 */
export const pageCreateComponent = async function (project, module, page = {
    name: '',
    injections: [],
    fields: [],
    methods: []
}, states = [], styles = [], error = null) {
    return `
        <div style="margin-top: 24px" class="container col-xl-9 col-lg-9 col-sm-12 col-md-11 col-12">
            ${errorMessageComponent(error)}
            <div>
                <div>
                    <div class="d-flex lex-row" style="margin-bottom: 8px">
                     <div class="d-flex lex-row" style="margin-bottom: 8px">
                        <h3>${page.name} page</h3>
                        <span style="flex: 1 1 auto"></span>
<!--                        <button class="btn btn-sm btn-primary">Save Service</button>-->
                    </div>
                        <span style="flex: 1 1 auto"></span>
                        <a href="/project/${project}/modules/${module}/resources/pages/${page.name}/template">
                            <button class="btn btn-sm btn-primary">Update Template</button>
                        </a>
                    </div>
                    <input class="form-control" disabled value="${page.name}" name="name" placeholder="enter page name" type="text">
                </div>
                <hr>
                ${await pageInjectionTableComponent(project, module, page.name, page.injections ? page.injections : [], states)}
                ${await pageStyleTableComponent(project, module, page.name, page.styles ? page.styles : [], styles)}
                ${pageMethodsListComponent(project, module, page.name, page.methods ? page.methods : [])}
            </div>
        </div>
`
}

