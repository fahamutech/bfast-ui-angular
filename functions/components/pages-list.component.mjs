import {errorMessageComponent} from "./error-message.component.mjs";
import {PageService} from "../services/page.service.mjs";
import {StorageUtil} from "../utils/storage.util.mjs";
import {AppUtil} from "../utils/app.util.mjs";

/**
 *
 * @param project - {string} current project
 * @param module - {string} current module
 * @param pages - {Array<string>>} list of all pages of that module
 * @param error - {string} - error to show
 * @return {string} - template of page list
 */
export const pageListComponent = async function (project, module, pages, error = null) {
    return `
        <div style="margin-top: 24px" class="container col-xl-9 col-lg-9 col-sm-11 col-md-10 col-10">
            ${errorMessageComponent(error)}
            <div>
                <div class="d-flex flex-row" style="margin: 8px 0">
                     <h2>Pages</h2>
                     <span style="flex: 1 1 auto"></span>
                     <a>
                        <button data-toggle="modal" data-target="#newPageModal" class="btn btn-sm btn-primary">New Page</button>
                     </a>
                </div>
                <div class="shadow">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th scope="col">#</th>
                          <th scope="col">Name</th>
<!--                          <th scope="col">Fields</th>-->
                          <th scope="col">Injections</th>
                          <th scope="col">Methods</th>
                        </tr>
                      </thead>
                      <tbody>
                       ${await getTableContents(project, module, pages)}
                      </tbody>
                    </table>
                    ${newPageModal(project, module)}
                </div>
            </div>
        </div>
    `
}


async function getTableContents(project, module, pages = []) {
    let row = '';
    for (const page of pages) {
        row += `<tr style="cursor: pointer">
                  <th scope="row">${pages.indexOf(page) + 1}</th>
                  <td><a href="/project/${project}/modules/${module}/resources/pages/${page}">${page}</a></td>
<!--                  <td></td>-->
                  <td>${await countInjections(project, module, page)}</td>
                  <td>${await countMethods(project, module, page)}</td>
                </tr>`
    }
    return row;
}


function newPageModal(project, module) {
    return `
    <!-- Modal -->
    <div class="modal fade" id="newPageModal" data-backdrop="static" data-keyboard="false" tabindex="-1"
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
            <form action="/project/${project}/modules/${module}/resources/pages" method="post">
                 <div>
                    <label class="form-label">Name</label>
                    <input placeholder="page name" name="name" type="text" class="form-control">
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

async function countMethods(project, module, page) {
    try {
        const storage = new StorageUtil();
        const serInJson = await new PageService(storage).pageFileToJson(project, module, page);
        return serInJson.methods.length;
    } catch (e) {
        return 0;
    }
}

async function countInjections(project, module, page) {
    try {
        const storage = new StorageUtil();
        const appUtil = new AppUtil();
        const serInJson = await new PageService(storage, appUtil).pageFileToJson(project, module, page);
        return serInJson.injections.length;
    } catch (e) {
        return 0;
    }
}

