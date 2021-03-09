import {errorMessageComponent} from "./error-message.component.mjs";
import {StorageUtil} from "../utils/storage.util.mjs";
import {GuardsService} from "../services/guards.service.mjs";
import {AppUtil} from "../utils/app.util.mjs";

const storage = new StorageUtil();
const appUtil = new AppUtil();

/**
 *
 * @param project - {string} current project
 * @param module - {string} current module
 * @param guards
 * @param error - {string} - error to show
 * @return {string} - template of service list
 */
export const guardListComponent = async function (project, module, guards, error = null) {
    return `
        <div style="margin-top: 24px" class="container col-xl-9 col-lg-9 col-sm-11 col-md-10 col-10">
            ${errorMessageComponent(error)}
            <div>
                <div class="d-flex flex-row" style="margin: 8px 0">
                     <h2>Guards</h2>
                     <span style="flex: 1 1 auto"></span>
                     <a>
                        <button data-toggle="modal" data-target="#newServiceModal" class="btn btn-sm btn-primary">New Guard</button>
                     </a>
                </div>
                <div class="shadow">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th scope="col">#</th>
                          <th scope="col">Name</th>
                          <th scope="col">Injections</th>
                          <th scope="col">Lines</th>
<!--                          <th scope="col">Methods</th>-->
                        </tr>
                      </thead>
                      <tbody>
                       ${await getTableContents(project, module, guards)}
                      </tbody>
                    </table>
                    ${newGuardModal(project, module)}
                </div>
            </div>
        </div>
    `
}


async function getTableContents(project, module, guards = [], lines = 0) {
    let row = '';
    for (const guard of guards) {
        row += `<tr style="cursor: pointer">
                  <th scope="row">${guards.indexOf(guard) + 1}</th>
                  <td><a href="/project/${project}/modules/${module}/resources/guards/${guard}">${guard}</a></td>
                  <td>${await countInjections(project, module, guard)}</td>
                  <td>${await countLines(project, module, guard)}</td>
                </tr>`
    }
    return row;
}


function newGuardModal(project, module) {
    return `
    <!-- Modal -->
    <div class="modal fade" id="newServiceModal" data-backdrop="static" data-keyboard="false" tabindex="-1"
     aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">Create Guard</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form action="/project/${project}/modules/${module}/resources/guards" method="post">
                 <div>
                    <label class="form-label">Name</label>
                    <input placeholder="guard name" name="name" type="text" class="form-control">
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

async function countLines(project, module, guard) {
    try {
        const guardInJson = await new GuardsService(storage, appUtil).getGuard(project, module, guard);
        return guardInJson.body.split(/\r\n|\r|\n/).length;
    } catch (e) {
        return 0;
    }
}

async function countInjections(project, module, guard) {
    try {
        const guardInJson = await new GuardsService(storage, appUtil).getGuard(project, module, guard);
        return guardInJson.injections.length;
    } catch (e) {
        return 0;
    }
}
