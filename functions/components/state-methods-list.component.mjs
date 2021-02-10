export const stateMethodsListComponent = function (project, module, state, methods = []) {
    return `
        <div class="d-flex flex-row" style="margin: 8px 0">
            <h3 style="margin: 0">Methods</h3>
            <span style="flex: 1 1 auto"></span>
            <a href="/project/${project}/modules/${module}/resources/states/${state}/method">
                <button  class="btn btn-sm btn-outline-primary">Add Method</button>
            </a>
         </div>
         <div class="shadow">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Inputs</th>
                  <th scope="col">Return</th>
                  <th scope="col">Body</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
               ${getTableContents(project, module, state, methods)}
              </tbody>
            </table>
        </div>
    `
}

function getTableContents(project, module, state, methods = []) {
    let row = '';
    for (const method of methods) {
        row += `<tr style="cursor: pointer">
                  <th scope="row">${methods.indexOf(method) + 1}</th>
                  <td>${method.name}</td>
                  <td>${method.inputs}</td>
                  <td>${method.return}</td>
                  <td>${method.body.toString().split('\n').length} Lines</td>
                  <td>
                    <div class="d-flex flex-row">
                        <a href="/project/${project}/modules/${module}/resources/states/${state}/method/${method.name}">
                            <button class="btn-sm btn btn-primary">Update</button>
                        </a>
                        <div style="width: 10px; height: 10px"></div>
                        <form id="deleteMethod${methods.indexOf(method)}" method="post" action="/project/${project}/modules/${module}/resources/states/${state}/method/${method.name}/delete">
                            <button class="btn-sm btn btn-danger">Delete</button>
                        </form>
                        <script>
                            document.getElementById('deleteMethod${methods.indexOf(method)}').addEventListener('submit', ev => {
                                ev.preventDefault();
                                const answer = confirm("${method.name} and its content will be deleted permanent");
                                if (answer === true){
                                    ev.target.submit();
                                }
                            })
                        </script>
                    </div>
                  </td>
                </tr>
`
    }
    return row;
}
