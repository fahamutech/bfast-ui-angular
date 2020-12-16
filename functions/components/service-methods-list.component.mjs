import {codeEditorComponent} from "./code-editor.component.mjs";

export const serviceMethodsListComponent = function (project, module, service, methods = []) {
    return `
        <div class="d-flex flex-row" style="margin: 8px 0">
            <h3 style="margin: 0">Methods</h3>
            <span style="flex: 1 1 auto"></span>
            <a href="/project/${project}/modules/${module}/resources/services/${service}/method">
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
               ${getTableContents(project, module, methods)}
              </tbody>
            </table>
        </div>
    `
}

function getTableContents(project, module, methods = []) {
    let row = '';
    for (const method of methods) {
        row += `<tr style="cursor: pointer">
                  <th scope="row">${methods.indexOf(method) + 1}</th>
                  <td>${method.name}</td>
                  <td>${method.inputs}</td>
                  <td>${method.return}</td>
                  <td>${method.body}</td>
                  <td>
                    <div class="d-flex flex-row">
                        <button class="btn-sm btn btn-primary" data-toggle="modal" data-target="#updateServiceModal">Update</button>
                        <div style="width: 10px; height: 10px"></div>
                        <button class="btn-sm btn btn-danger">Delete</button>
                    </div>
                  </td>
                </tr>
`
    }
    return row;
}
