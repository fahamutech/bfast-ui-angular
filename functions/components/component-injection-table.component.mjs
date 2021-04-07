export const componentInjectionTableComponent = async function (project, module, component, injections = [], otherStates = [], imports) {
    return `
        <div class="d-flex flex-row" style="margin: 8px 0">
             <h3 style="margin: 0">States</h3>
             <span style="flex: 1 1 auto"></span>
             <button class="btn btn-sm btn-outline-primary" data-toggle="modal" data-target="#addInjectionModal">Add State / Inject Lib</button>
        </div>
        <div class="shadow">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">State / Lib</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
               ${getTableContents(project, module, component, injections)}
              </tbody>
            </table>
            ${await addInjectionModal(project, module, component, otherStates, imports)}
        </div>
    `
}

function getTableContents(project, module, component, injections = []) {
    let row = '';
    for (const injection of injections) {
        row += `<tr style="cursor: pointer">
                  <th scope="row">${injections.indexOf(injection) + 1}</th>
                  <td>${injection.name}</td>
                  <td style="flex-grow: 1">${injection.auto?injection.service+'.state.ts': injection.service}</td>
                  <td>
                    <div class="d-flex flex-row">
                        <form method="post" action="/project/${project}/modules/${module}/resources/components/${component}/injections/${injection.auto?injection.service+'.state.ts': injection.service}.state.ts/delete">
                            <button type="submit" class="btn-sm btn btn-danger">Delete</button>
                        </form>
                    </div>
                  </td>
                </tr>`
    }
    return row;
}


async function addInjectionModal(project, module, component, states, imports = []) {
    function allOtherServices() {
        let externalLibList = ''
        for (const imp of imports) {
            externalLibList += `
            <option value="${imp}">${imp}</option>
            `
        }
        let externalLibInjectForm = `
            <div>
                <form method="post" action="/project/${project}/modules/${module}/resources/components/${component}/injections">
                    <div>
                        <label class="form-label btn-block">
                            Name
                            <select class="form-control"  name="name" id="name">
                                ${externalLibList}
                            </select>
                        </label>
                    </div>
                    <button class="btn btn-primary btn-block" type="submit">
                       Inject External Lib
                    </button>
                </form>
            </div>
            <hr>
        `;
        for (const state of states) {
            externalLibInjectForm += `
            <div style="margin-bottom: 5px">
                <form method="post" action="/project/${project}/modules/${module}/resources/components/${component}/injections/${state}">
                    <button class="btn btn-outline-primary btn-block" type="submit">
                        ${state}
                    </button>
                </form>
            </div>`
        }
        if (externalLibInjectForm === '') {
            return 'No states to add';
        } else {
            return externalLibInjectForm;
        }
    }

    return `
    <!-- Modal -->
    <div class="modal fade" id="addInjectionModal" data-backdrop="static" data-keyboard="false" tabindex="-1"
     aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">States and libs</h5>
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
