import {errorMessageComponent} from "./error-message.component.mjs";
import {StorageUtil} from "../utils/storage.util.mjs";
import {ModelsService} from "../services/models.service.mjs";

/**
 *
 * @param project - {string} current project
 * @param module - {string} current module
 * @param models
 * @param error - {string} - error to show
 * @return {string} - template of service list
 */
export const modelListComponent = async function (project, module, models, error = null) {
    return `
        <div style="margin-top: 24px" class="container col-xl-9 col-lg-9 col-sm-11 col-md-10 col-10">
            ${errorMessageComponent(error)}
            <div>
                <div class="d-flex flex-row" style="margin: 8px 0">
                     <h2>Models</h2>
                     <span style="flex: 1 1 auto"></span>
                     <a>
                        <button data-toggle="modal" data-target="#newServiceModal" class="btn btn-sm btn-primary">New Style</button>
                     </a>
                </div>
                <div class="shadow">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th scope="col">#</th>
                          <th scope="col">Name</th>
                          <th scope="col">Lines</th>
<!--                          <th scope="col">Methods</th>-->
                        </tr>
                      </thead>
                      <tbody>
                       ${await getTableContents(project, module, models)}
                      </tbody>
                    </table>
                    ${newModelModal(project, module)}
                </div>
            </div>
        </div>
    `
}


async function getTableContents(project, module, models = [], lines = 0) {
    let row = '';
    for (const model of models) {
        row += `<tr style="cursor: pointer">
                  <th scope="row">${models.indexOf(model) + 1}</th>
                  <td><a href="/project/${project}/modules/${module}/resources/models/${model}">${model}</a></td>
                  <td>${await countLines(project, module, model)}</td>
                </tr>`
    }
    return row;
}


function newModelModal(project, module) {
    return `
    <!-- Modal -->
    <div class="modal fade" id="newServiceModal" data-backdrop="static" data-keyboard="false" tabindex="-1"
     aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">Create Model</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form action="/project/${project}/modules/${module}/resources/models" method="post">
                 <div>
                    <label class="form-label">Name</label>
                    <input placeholder="style name" name="name" type="text" class="form-control">
                 </div>
                 <div style="padding: 8px 0">
                    <button type="submit" class="btn btn-primary btn-block">Save</button>
                 </div>
            </form>
          </div>
<!--          <div class="modal-footer">-->
<!--            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>-->
<!--          </div>-->
        </div>
      </div>
    </div>
    `
}

async function countLines(project, module, model) {
    try {
        const storage = new StorageUtil();
        const modelInJson = await new ModelsService(storage).getModel(project, module, model);
        return modelInJson.body.split(/\r\n|\r|\n/).length;
    } catch (e) {
        return 0;
    }
}
