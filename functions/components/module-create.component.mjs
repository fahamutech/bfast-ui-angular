import {errorMessageComponent} from "./error-message.component.mjs";

/**
 *
 * @param error - {string}
 * @param project - {string} current project name
 * @returns {string}
 */
export const moduleCreateComponent = function (error, project) {
    return (`
        <div style="margin-top: 24px;" class="container col-9">
            ${errorMessageComponent(error)}
            <form class="form" action="/project/${project}/modules/create" method="post" enctype="application/json">
                <div class="form-group">
                    <label for="name" class="form-label">Module Name</label>
                    <input id="name" class="form-control" name="name" type="text" placeholder="module name">
                </div>
                <div class="form-group">
                    <label for="detail" class="form-label">Module Description</label>
                    <textarea id="detail" class="form-control" name="detail" placeholder="Detail"></textarea>
                </div>
                <div class="form-group" style="margin-top: 16px">
                    <button class="btn btn-primary btn-block" style="width: 100%;">Create Module</button>
                </div>
            </form>
        </div>
     `);
}
