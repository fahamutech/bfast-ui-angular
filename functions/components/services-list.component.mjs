import {errorMessageComponent} from "./error-message.component.mjs";

/**
 *
 * @param project - {string} current project
 * @param module - {string} current module
 * @param services - {Array<string>>} list of all services of that module
 * @param error - {string} - error to show
 * @return {string} - template of service list
 */
export const serviceListComponent = function (project, module, services, error = null) {
    return `
        <div style="margin-top: 24px" class="container col-xl-9 col-lg-9 col-sm-11 col-md-10 col-10">
            ${errorMessageComponent(error)}
            <div>
                <div class="d-flex flex-row" style="margin: 8px 0">
                     <h2>Services</h2>
                     <span style="flex: 1 1 auto"></span>
                     <a href="/project/${project}/module/view/${module}/services/create">
                        <button class="btn btn-sm btn-primary">New Service</button>
                     </a>
                </div>
                <div class="shadow">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th scope="col">#</th>
                          <th scope="col">Name</th>
                          <th scope="col">Fields</th>
                          <th scope="col">Methods</th>
                        </tr>
                      </thead>
                      <tbody>
                       ${getTableContents(project, module,services)}
                      </tbody>
                    </table>
                </div>
            </div>
        </div>
    `
}


function getTableContents(project, module, services = []) {
    let row = '';
    for (const service of services) {
        row += `<tr style="cursor: pointer">
                  <th scope="row">${services.indexOf(service) + 1}</th>
                  <td><a href="/project/${project}/module/view/${module}/services/create?update=${services}">${service}</a></td>
                  <td></td>
                  <td></td>
                </tr>`
    }
    return row;
}
