export const componentFieldsTableComponent = async function (project, module, component, fields = []) {
    return `
        <div class="d-flex flex-row" style="margin: 8px 0">
             <h3 style="margin: 0">Fields</h3>
             <span style="flex: 1 1 auto"></span>
             <button class="btn btn-sm btn-outline-primary" data-toggle="modal" data-target="#addComponentModal">Add Field</button>
        </div>
        <div class="shadow">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Item</th>
<!--                  <th scope="col">Value</th>-->
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
               ${getTableContents(project, module, component, fields)}
              </tbody>
            </table>
            ${await addFieldModal(project, module, component)}
        </div>
    `
}

function getTableContents(project, module, component, fields = []) {
    let row = '';
    for (const field of fields) {
        row += `<tr style="cursor: pointer">
                  <th scope="row">${fields.indexOf(field) + 1}</th>
                  <td style="flex-grow: 1">${field.value}</td>
<!--                  <td style="flex-grow: 1">${field.value}</td>-->
                  <td>
                    <div class="d-flex flex-row">
                        <form method="post" action="/project/${project}/modules/${module}/resources/components/${component}/fields/${encodeURIComponent(field.name)}/delete">
                            <button type="submit" class="btn-sm btn btn-danger">Delete</button>
                        </form>
                    </div>
                  </td>
                </tr>`
    }
    return row;
}


async function addFieldModal(project, module, component) {
    function fieldForm() {
        return `
         <div style="margin-bottom: 5px">
            <form method="post" action="/project/${project}/modules/${module}/resources/components/${component}/fields">
            <div style="margin-bottom: 8px">
               <label class="form-label">Value</label>
               <input class="form-control" placeholder="Full field definition" name="name" type="text">
            </div>
            <button class="btn btn-primary btn-block" type="submit">
               Add
            </button>
            </form>
         </div>
       `
    }

    return `
    <!-- Modal -->
    <div class="modal fade" id="addComponentModal" data-backdrop="static" data-keyboard="false" tabindex="-1"
     aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">New Field</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            ${fieldForm()}
          </div>
<!--          <div class="modal-footer">-->
<!--            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>-->
<!--          </div>-->
        </div>
      </div>
    </div>
    `
}
