import {errorMessageComponent} from "./error-message.component.mjs";
import {ComponentService} from "../services/component.service.mjs";
import {StorageUtil} from "../utils/storage.util.mjs";
import {AppUtil} from "../utils/app.util.mjs";

/**
 *
 * @param project - {string} current project
 * @param module - {string} current module
 * @param components - {Array<string>>} list of all components of that module
 * @param error - {string} - error to show
 * @return {string} - template of component list
 */
export const componentListComponent = async function (project, module, components, error = null) {
    return `
        <div style="margin-top: 24px" class="container col-xl-9 col-lg-9 col-sm-11 col-md-10 col-10">
            ${errorMessageComponent(error)}
            <div>
                <div class="d-flex flex-row" style="margin: 8px 0">
                     <h2>Components</h2>
                     <span style="flex: 1 1 auto"></span>
                     <a>
                        <button data-toggle="modal" data-target="#newComponentModal" class="btn btn-sm btn-primary">New Component</button>
                     </a>
                </div>
                <div class="shadow">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th scope="col">#</th>
                          <th scope="col">Name</th>
                          <th scope="col">Fields</th>
                          <th scope="col">Injections</th>
                          <th scope="col">Methods</th>
                        </tr>
                      </thead>
                      <tbody>
                       ${await getTableContents(project, module, components)}
                      </tbody>
                    </table>
                    ${newComponentModal(project, module)}
                </div>
            </div>
        </div>
    `
}


async function getTableContents(project, module, components = []) {
    let row = '';
    for (const component of components) {
        row += `<tr style="cursor: pointer">
                  <th scope="row">${components.indexOf(component) + 1}</th>
                  <td><a href="/project/${project}/modules/${module}/resources/components/${component}">${component}</a></td>
                  <td>${await countFields(project, module, component)}</td>
                  <td>${await countInjections(project, module, component)}</td>
                  <td>${await countMethods(project, module, component)}</td>
                </tr>`
    }
    return row;
}


function newComponentModal(project, module) {
    return `
    <!-- Modal -->
    <div class="modal fade" id="newComponentModal" data-backdrop="static" data-keyboard="false" tabindex="-1"
     aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">Create Method</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form action="/project/${project}/modules/${module}/resources/components" method="post">
                 <div>
                    <label class="form-label">Name</label>
                    <input placeholder="component name" name="name" type="text" class="form-control">
                 </div>
                 <div style="padding: 8px 0">
                    <button type="submit" class="btn btn-primary btn-block">Save</button>
                 </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
    `
}

async function countMethods(project, module, component) {
    try {
        const storage = new StorageUtil();
        const appUtil = new AppUtil();
        const serInJson = await new ComponentService(storage, appUtil).componentFileToJson(project, module, component);
        return serInJson.methods.length;
    } catch (e) {
        return 0;
    }
}

async function countInjections(project, module, component) {
    try {
        const storage = new StorageUtil();
        const appUtil = new AppUtil();
        const serInJson = await new ComponentService(storage,appUtil).componentFileToJson(project, module, component);
        return serInJson.injections.length;
    } catch (e) {
        return 0;
    }
}

async function countFields(project, module, component) {
    try {
        const storage = new StorageUtil();
        const appUtil = new AppUtil();
        const serInJson = await new ComponentService(storage, appUtil).componentFileToJson(project, module, component);
        return serInJson.fields.length;
    } catch (e) {
        return 0;
    }
}
