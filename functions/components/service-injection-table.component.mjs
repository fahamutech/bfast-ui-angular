export const serviceInjectionTableComponent = function (project, module, injections = []) {
    return `
        <div class="d-flex flex-row" style="margin: 8px 0">
             <h3 style="margin: 0">Injections</h3>
        </div>
        <div class="shadow">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Service</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
               ${getTableContents(project, module, injections)}
              </tbody>
            </table>
        </div>
    `
}

function getTableContents(project, module, injections = []) {
    let row = '';
    for (const injection of injections) {
        row += `<tr style="cursor: pointer">
                  <th scope="row">${injections.indexOf(injection) + 1}</th>
                  <td>${injection.name}</td>
                  <td>${injection.service}.service.ts</td>
                  <td>
                    <div class="d-flex flex-row">
                        <button class="btn-sm btn btn-primary">Update</button>
                        <div style="width: 10px; height: 10px"></div>
                        <button class="btn-sm btn btn-danger">Delete</button>
                    </div>
                  </td>
                </tr>`
    }
    return row;
}
