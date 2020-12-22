export const guardMethodsListComponent = function (project, module, guard, guardBody = '') {
    return `
        <div class="d-flex flex-row" style="margin: 8px 0">
            <h3 style="margin: 0">Type</h3>
            <span style="flex: 1 1 auto"></span>
<!--            <a href="/project/${project}/modules/${module}/resources/guards/${guard}/method">-->
<!--                <button  class="btn btn-sm btn-outline-primary">Update</button>-->
<!--            </a>-->
         </div>
         <div class="shadow">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
<!--                  <th scope="col">Inputs</th>-->
<!--                  <th scope="col">Return</th>-->
                  <th scope="col">Body</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
               ${getTableContents(project, module, guard, guardBody)}
              </tbody>
            </table>
        </div>
    `
}

function getTableContents(project, module, guard, guardBody = '') {
    let row = '';
    // for (const method of methods) {
    row += `<tr style="cursor: pointer">
                  <th scope="row">1</th>
                  <td>canActivate</td>
                  <td>${guardBody}</td>
                  <td>
                    <div class="d-flex flex-row">
                        <a href="/project/${project}/modules/${module}/resources/guards/${guard}/method/canActivate">
                            <button class="btn-sm btn btn-primary">Update</button>
                        </a>
                        <div style="width: 10px; height: 10px"></div>
                    </div>
                  </td>
                </tr>
`
    //  }
    return row;
}
