export const serviceImportsTableComponent = function (
    project,
    module,
    service,
    imports = [],
) {
    return `
        <div class="d-flex flex-row" style="margin: 8px 0">
             <h3 style="margin: 0">Imports</h3>
             <span style="flex: 1 1 auto"></span>
             <button class="btn btn-sm btn-outline-primary" data-toggle="modal" data-target="#addImportToServiceModal">Add Lib</button>
        </div>
        <div class="shadow">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Type</th>
                  <th scope="col">Reference</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
               ${getTableContents(project, module, service, imports)}
              </tbody>
            </table>
            ${ addInjectionModal(project, module, service)}
        </div>
    `
}

function getTableContents(project, module, service, imports = []) {
    let row = '';
    for (const importComponent of imports) {
        row += `<tr style="cursor: pointer">
                  <th scope="row">${imports.indexOf(importComponent) + 1}</th>
                  <td>${importComponent.name}</td>
                  <td>${importComponent.type}</td>
                  <td style="flex-grow: 1">${importComponent.ref}</td>
                  <td>
                    <div class="d-flex flex-row">
                        <form method="post" action="/project/${project}/modules/${module}/resources/services/${service}/imports/${encodeURIComponent(importComponent.name)}/delete">
                            <button type="submit" class="btn-sm btn btn-danger">Delete</button>
                        </form>
                    </div>
                  </td>
                </tr>`
    }
    return row;
}


function addInjectionModal(project, module, service) {
    function thirdPartLibs() {
        return `
           <div style="margin-bottom: 5px">
                <form method="post" action="/project/${project}/modules/${module}/resources/services/${service}/imports">
                    <div>
                        <label class="form-label btn-block">
                            Name
                            <input class="form-control" placeholder="import name..." name="name" id="name">
                        </label>
                    </div>
                     <div>
                        <label class="form-label btn-block">
                            Type
                            <select class="form-control" name="type" id="type">
                                <option value="module">Module</option>
                                <option value="common">Common</option>
                            </select>
                        </label>
                    </div>
                    <div>
                        <label class="form-label btn-block">
                            Reference
                            <input class="form-control btn-block" placeholder="import reference..." name="ref" id="ref">
                        </label>
                    </div>
                    <button class="btn btn-primary btn-block" type="submit">
                       Import
                    </button>
                </form>
                <hr style="margin-bottom: 24px">
            </div>`;
    }

    return `
    <!-- Modal -->
    <div class="modal fade" id="addImportToServiceModal" data-backdrop="static" data-keyboard="false" tabindex="-1"
     aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">External library</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            ${thirdPartLibs()}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
    `
}
