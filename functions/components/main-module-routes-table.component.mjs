export const mainModuleRoutesTableComponent = async function (
    project,
    routes,
    modules
) {
    return `
        <div class="d-flex flex-row" style="margin: 8px 0">
             <h3 style="margin: 0">Routing</h3>
             <span style="flex: 1 1 auto"></span>
             <button class="btn btn-sm btn-outline-primary" data-toggle="modal" data-target="#addRouteToMainModuleModal">
                Add Route
             </button>
        </div>
        <div class="shadow">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Path</th>
                  <th scope="col">Ref</th>
                  <th scope="col">Module</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
               ${getTableContents(project, routes)}
              </tbody>
            </table>
            ${await addInjectionModal(project, modules)}
        </div>
    `
}

function getTableContents(project, routes = []) {
    let row = '';
    for (const route of routes) {
        row += `<tr style="cursor: pointer">
                  <th scope="row">${routes.indexOf(route) + 1}</th>
                  <td>/${route.path}</td>
                  <td style="flex-grow: 1">${route.ref}</td>
                  <td style="flex-grow: 1">${route.module}</td>
                  <td>
                    <div class="d-flex flex-row">
                        <form method="post" action="/project/${project}/modules/routes/${encodeURIComponent(route.path === '' ? '-' : route.path)}/delete">
                            <button type="submit" class="btn-sm btn btn-danger">Delete</button>
                        </form>
                    </div>
                  </td>
                </tr>`
    }
    return row;
}


function pagesOptions(pages) {
    let options = ``;
    for (const page of pages) {
        options += `<option value="${page}">${page}</option>`
    }
    return options;
}

function guardsOptions(guards) {
    let options = ``;
    for (const guard of guards) {
        options += `<option value="${guard}">${guard}</option>`
    }
    return options;
}

async function addInjectionModal(project, modules) {
    function allOtherServices() {
        return `
           <div style="margin-bottom: 5px">
                <h3>Automatic</h3>
                <form method="post" action="/project/${project}/modules/routes">
                    <div>
                        <label class="form-label btn-block">
                            Path
                            <input class="form-control" placeholder="Enter path ( start with / )" name="path" id="path">
                        </label>
                    </div>
                    <div>
                        <label class="form-label btn-block">
                            Module
                            <select class="form-control" name="module">
                                ${pagesOptions(modules)}
                            </select>
                        </label>
                    </div>
                    <button class="btn btn-primary btn-block" type="submit">
                       Save
                    </button>
                </form>
                <hr>
                <h3>Manual</h3>
                <form method="post" action="/project/${project}/modules/routes">
                    <div>
                        <label class="form-label btn-block">
                            Path
                            <input class="form-control" placeholder="Enter path ( start with / )" name="path" id="path2">
                        </label>
                    </div>
                    <div>
                        <label class="form-label btn-block">
                            Module
                            <input class="form-control" placeholder="Enter module name" name="module" id="module2">
                        </label>
                    </div>
                    <div>
                        <label class="form-label btn-block">
                            Ref
                            <input class="form-control" placeholder="module reference" name="ref" id="ref2">
                        </label>
                    </div>
                    <button class="btn btn-outline-primary btn-block" type="submit">
                       Save Manual
                    </button>
                </form>
            </div>`;
        // for (const _module of modules) {
        //     otherServices += `
        //     <div style="margin-bottom: 5px">
        //         <form method="post" action="/project/${project}/modules/${module}/resources/imports">
        //             <input type="hidden" name="name" value="${_module}">
        //             <input type="hidden" name="ref" value="../${_module}/${_module}.module">
        //             <button class="btn btn-outline-primary btn-block" type="submit">
        //                 ${_module}
        //             </button>
        //         </form>
        //     </div>`
        // }
        // if (otherServices === '') {
        //     return 'No other modules';
        // } else {
        //     return otherServices;
        // }
    }

    return `
    <!-- Modal -->
    <div class="modal fade" id="addRouteToMainModuleModal" data-backdrop="static" data-keyboard="false" tabindex="-1"
     aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">New Route</h5>
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
