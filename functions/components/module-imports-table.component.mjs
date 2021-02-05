export const moduleImportsTableComponent = async function (
    project,
    module,
    imports = [{name: '', ref: ''}],
    modules = [{name: '', ref: ''}]
) {
    return `
        <div class="d-flex flex-row" style="margin: 8px 0">
             <h3 style="margin: 0">Imports</h3>
             <span style="flex: 1 1 auto"></span>
             <button class="btn btn-sm btn-outline-primary" data-toggle="modal" data-target="#addImportToModuleModal">Add Module</button>
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
               ${getTableContents(project, module, imports)}
              </tbody>
            </table>
            ${await addInjectionModal(project, module, modules)}
        </div>
    `
}

function getTableContents(project, module, imports = []) {
    let row = '';
    for (const importComponent of imports) {
        row += `<tr style="cursor: pointer">
                  <th scope="row">${imports.indexOf(importComponent) + 1}</th>
                  <td>${importComponent.name}</td>
                  <td style="flex-grow: 1">${importComponent.ref}</td>
                  <td>
                    <div class="d-flex flex-row">
                        <form method="post" action="/project/${project}/modules/${module}/resources/imports/${importComponent.name}/delete">
                            <button type="submit" class="btn-sm btn btn-danger">Delete</button>
                        </form>
                    </div>
                  </td>
                </tr>`
    }
    return row;
}


async function addInjectionModal(project, module, modules) {
    function allOtherServices() {
        let otherServices = `
           <div style="margin-bottom: 5px">
                <form method="post" action="/project/${project}/modules/${module}/resources/imports">
                    <div>
                        <label class="form-label btn-block">
                            Name
                            <input class="form-control" placeholder="Enter module name" name="name" id="name">
                        </label>
                    </div>
                    <div>
                        <label class="form-label btn-block">
                            Reference
                            <input class="form-control btn-block" placeholder="Enter import reference" name="ref" id="ref">
                        </label>
                    </div>
                    <button class="btn btn-primary btn-block" type="submit">
                       Import Manual
                    </button>
                </form>
                <hr style="margin-bottom: 24px">
            </div>`
        for (const _module of modules) {
            otherServices += `
            <div style="margin-bottom: 5px">
                <form method="post" action="/project/${project}/modules/${module}/resources/imports">
                    <input type="hidden" name="name" value="${_module}">
                    <input type="hidden" name="ref" value="../${_module}/${_module}.module">
                    <button class="btn btn-outline-primary btn-block" type="submit">
                        ${_module}
                    </button>
                </form>
            </div>`
        }
        if (otherServices === '') {
            return 'No other modules';
        } else {
            return otherServices;
        }
    }

    return `
    <!-- Modal -->
    <div class="modal fade" id="addImportToModuleModal" data-backdrop="static" data-keyboard="false" tabindex="-1"
     aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">Other Modules</h5>
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
