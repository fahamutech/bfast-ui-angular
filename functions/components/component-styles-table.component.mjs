export const componentStyleTableComponent = async function (project, module, component, styles = [], otherStyles = []) {
    return `
        <div class="d-flex flex-row" style="margin: 8px 0">
             <h3 style="margin: 0">Styles</h3>
             <span style="flex: 1 1 auto"></span>
             <button class="btn btn-sm btn-outline-primary" data-toggle="modal" data-target="#addStyleModal">Add Style</button>
        </div>
        <div class="shadow">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Style</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
               ${getTableContents(project, module, component, styles)}
              </tbody>
            </table>
            ${await addInjectionModal(project, module, component, otherStyles)}
        </div>
    `
}

function getTableContents(project, module, component, styles = []) {
    let row = '';
    for (const style of styles) {
        row += `<tr style="cursor: pointer">
                  <th scope="row">${styles.indexOf(style) + 1}</th>
                  <td>${style}</td>
                  <td style="flex-grow: 1">SCSS</td>
                  <td>
                    <div class="d-flex flex-row">
                        <form method="post" action="/project/${project}/modules/${module}/resources/components/${component}/styles/${style}.style.scss/delete">
                            <button type="submit" class="btn-sm btn btn-danger">Delete</button>
                        </form>
                    </div>
                  </td>
                </tr>`
    }
    return row;
}


async function addInjectionModal(project, module, component, otherStyles) {
    function allOtherStyles() {
        let styles = ''
        for (const style of otherStyles) {
            styles += `
            <div style="margin-bottom: 5px">
                <form method="post" action="/project/${project}/modules/${module}/resources/components/${component}/styles/${style}">
                    <button class="btn btn-outline-primary btn-block" type="submit">
                        ${style}
                    </button>
                </form>
            </div>`
        }
        if (styles === '') {
            return 'No Other Services';
        } else {
            return styles;
        }
    }

    return `
    <!-- Modal -->
    <div class="modal fade" id="addStyleModal" data-backdrop="static" data-keyboard="false" tabindex="-1"
     aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">Other Styles</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            ${allOtherStyles()}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
    `
}
