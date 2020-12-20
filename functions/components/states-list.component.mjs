import {errorMessageComponent} from "./error-message.component.mjs";
import {StateService} from "../services/state.service.mjs";
import {StorageUtil} from "../utils/storage.util.mjs";

/**
 *
 * @param project - {string} current project
 * @param module - {string} current module
 * @param states - {Array<string>>} list of all states of that module
 * @param error - {string} - error to show
 * @return {string} - template of state list
 */
export const stateListComponent = async function (project, module, states, error = null) {
    return `
        <div style="margin-top: 24px" class="container col-xl-9 col-lg-9 col-sm-11 col-md-10 col-10">
            ${errorMessageComponent(error)}
            <div>
                <div class="d-flex flex-row" style="margin: 8px 0">
                     <h2>States</h2>
                     <span style="flex: 1 1 auto"></span>
                     <a>
                        <button data-toggle="modal" data-target="#newStateModal" class="btn btn-sm btn-primary">New State</button>
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
                       ${await getTableContents(project, module, states)}
                      </tbody>
                    </table>
                    ${newStateModal(project, module)}
                </div>
            </div>
        </div>
    `
}


async function getTableContents(project, module, states = []) {
    let row = '';
    for (const state of states) {
        row += `<tr style="cursor: pointer">
                  <th scope="row">${states.indexOf(state) + 1}</th>
                  <td><a href="/project/${project}/modules/${module}/resources/states/${state}">${state}</a></td>
                  <td>${await countStates(project, module, state)}</td>
                  <td>${await countInjections(project, module, state)}</td>
                  <td>${await countMethods(project, module, state)}</td>
                </tr>`
    }
    return row;
}


function newStateModal(project, module) {
    return `
    <!-- Modal -->
    <div class="modal fade" id="newStateModal" data-backdrop="static" data-keyboard="false" tabindex="-1"
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
            <form action="/project/${project}/modules/${module}/resources/states" method="post">
                 <div>
                    <label class="form-label">Name</label>
                    <input placeholder="state name" name="name" type="text" class="form-control">
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

async function countMethods(project, module, state) {
    try {
        const storage = new StorageUtil();
        const serInJson = await new StateService(storage).stateFileToJson(state, project, module);
        return serInJson.methods.length;
    } catch (e) {
        return 0;
    }
}

async function countInjections(project, module, state) {
    try {
        const storage = new StorageUtil();
        const serInJson = await new StateService(storage).stateFileToJson(state, project, module);
        return serInJson.injections.length;
    } catch (e) {
        return 0;
    }
}

async function countStates(project, module, state) {
    try {
        const storage = new StorageUtil();
        const serInJson = await new StateService(storage).stateFileToJson(state, project, module);
        return serInJson.states.length;
    } catch (e) {
        return 0;
    }
}
