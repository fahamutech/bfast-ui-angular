export const guardInjectionTableComponent = async function (project, module, guard, injections = [], services = []) {
    return `
        <div class="d-flex flex-row" style="margin: 8px 0">
             <h3 style="margin: 0">Injections</h3>
             <span style="flex: 1 1 auto"></span>
             <button class="btn btn-sm btn-outline-primary" data-toggle="modal" data-target="#addInjectionToGuardModal">Add Injection</button>
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
               ${getTableContents(project, module, guard, injections)}
              </tbody>
            </table>
            ${await addInjectionModal(project, module, guard, services)}
        </div>
    `
}

function getTableContents(project, module, guard, injections = []) {
    let row = '';
    for (const injection of injections) {
        row += `<tr style="cursor: pointer">
                  <th scope="row">${injections.indexOf(injection) + 1}</th>
                  <td>${injection.name}</td>
                  <td style="flex-grow: 1">${injection.service}</td>
                  <td>
                    <div class="d-flex flex-row">
                        ${injection.name==='router'?'readonly':`<form method="post" action="/project/${project}/modules/${module}/resources/guards/${guard}/injections/${injection.service}.guard.ts/delete">
                            <button type="submit" class="btn-sm btn btn-danger">Delete</button>
                        </form>`}
                    </div>
                  </td>
                </tr>`
    }
    return row;
}


async function addInjectionModal(project, module, guard, services) {
    function allOtherServices() {
        let otherServices = ''
        for (const injection of services) {
            otherServices += `
            <div style="margin-bottom: 5px">
                <form method="post" action="/project/${project}/modules/${module}/resources/guards/${guard}/injections/${injection}">
                    <button class="btn btn-outline-primary btn-block" type="submit">
                        ${injection}
                    </button>
                </form>
            </div>`
        }
        if (otherServices === '') {
            return 'No Services';
        } else {
            return otherServices;
        }
    }

    return `
    <!-- Modal -->
    <div class="modal fade" id="addInjectionToGuardModal" data-backdrop="static" data-keyboard="false" tabindex="-1"
     aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">Other Services</h5>
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
