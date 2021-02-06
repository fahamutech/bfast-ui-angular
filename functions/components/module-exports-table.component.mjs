import {AppUtil} from "../utils/app.util.mjs";

export const moduleExportsTableComponent = async function (project, module, exports = [], components = []) {
    return `
        <div class="d-flex flex-row" style="margin: 8px 0">
             <h3 style="margin: 0">Exports</h3>
             <span style="flex: 1 1 auto"></span>
             <button class="btn btn-sm btn-outline-primary" data-toggle="modal" data-target="#addExportToModuleModal">Add Component</button>
        </div>
        <div class="shadow">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Reference</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
               ${getTableContents(project, module, exports)}
              </tbody>
            </table>
            ${await addInjectionModal(project, module, components)}
        </div>
    `
}

function getTableContents(project, module, exports = []) {
    let row = '';
    for (const exportComponent of exports) {
        row += `<tr style="cursor: pointer">
                  <th scope="row">${exports.indexOf(exportComponent) + 1}</th>
                  <td>${exportComponent}</td>
                  <td style="flex-grow: 1">./components/${new AppUtil().camelCaseToKebal(exportComponent)}.component.ts</td>
                  <td>
                    <div class="d-flex flex-row">
                        <form method="post" action="/project/${project}/modules/${module}/resources/exports/${exportComponent}/delete">
                            <button type="submit" class="btn-sm btn btn-danger">Delete</button>
                        </form>
                    </div>
                  </td>
                </tr>`
    }
    return row;
}


async function addInjectionModal(project, module, components) {
    function allOtherServices() {
        let otherServices = ''
        for (const component of components) {
            otherServices += `
            <div style="margin-bottom: 5px">
                <form method="post" action="/project/${project}/modules/${module}/resources/exports/${component}">
                    <button class="btn btn-outline-primary btn-block" type="submit">
                        ${component}
                    </button>
                </form>
            </div>`
        }
        if (otherServices === '') {
            return 'No Components';
        } else {
            return otherServices;
        }
    }

    return `
    <!-- Modal -->
    <div class="modal fade" id="addExportToModuleModal" data-backdrop="static" data-keyboard="false" tabindex="-1"
     aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">Module Components</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            ${allOtherServices()}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
    `
}
