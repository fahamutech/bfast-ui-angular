import {projectListRecentComponent} from "./project-list-recent.component.mjs";
import {errorMessageComponent} from "./error-message.component.mjs";

export const projectListComponent = function (projects, error = null) {
    return `
        <div class="container col-xl-9 col-lg-9 col-sm-11 col-md-10" style="margin-top: 24px">
            ${errorMessageComponent(error)}
            <div class="d-flex fle-row align-items-center">
                <h2>Recent</h2>
                <span style="flex:  1 1 auto"></span>
                <button class="btn btn-sm btn-primary" data-toggle="modal" data-target="#addProjectModal" style="height: 36px">
                    Import
                </button>
                <div style="width: 20px; height: 20px"></div>
                 <button class="btn btn-sm btn-primary" data-toggle="modal" data-target="#createProjectModal" style="height: 36px">
                    Create
                </button>
            </div>
            <hr>
            ${projectListRecentComponent(projects)}
            ${importProjectModal()}
            ${createProjectModal()}
        </div>
    `;
}

function importProjectModal() {
    return `
    <div class="modal fade" id="addProjectModal" data-backdrop="static" data-keyboard="false" tabindex="-1"
     aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">Import Project</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
              <p>
                    Open your terminal and go to your project folder and run the following code <br><br>
                    <code>bfast ui serve -o </code> <br><br>
                  
              </p>
<!--            <form action="/project" method="post">-->
<!--                 <div>-->
<!--                    <label class="form-label">Name</label>-->
<!--                    <input placeholder="project name" name="name" type="text" class="form-control">-->
<!--                 </div>-->
<!--                 <div>-->
<!--                    <label class="form-label">Main Module</label>-->
<!--                    <input placeholder="main module name" name="module" type="text" class="form-control">-->
<!--                 </div>-->
<!--                 <div>-->
<!--                    <label class="form-label">Path</label>-->
<!--                    <input placeholder="project path" name="projectPath" type="text" class="form-control">-->
<!--                 </div>-->
<!--                 <div style="padding: 8px 0">-->
<!--                    <button type="submit" class="btn btn-primary btn-block">Save</button>-->
<!--                 </div>-->
<!--            </form>-->
          </div>
        </div>
      </div>
    </div>
    `
}

function createProjectModal() {
    return `
    <div class="modal fade" id="createProjectModal" data-backdrop="static" data-keyboard="false" tabindex="-1"
     aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">Create Project</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
              <p>
                    Open your terminal and run the followings <br><br>
                    1. <code>bfast ui create project-name</code> <br>
                    2. <code>cd project-name</code> <br>
                    3. <code>bfast ui serve -o</code> <br><br>
                    Replace <code>project-name</code> with the name 
                    of your project.
              </p>
<!--            <form action="/project/create" method="post">-->
<!--                 <div>-->
<!--                    <label class="form-label">Name</label>-->
<!--                    <input placeholder="project name" name="name" type="text" class="form-control">-->
<!--                 </div>-->
<!--                 <div style="padding: 8px 0">-->
<!--                    <button type="submit" class="btn btn-primary btn-block">Save</button>-->
<!--                 </div>-->
<!--            </form>-->
          </div>
        </div>
      </div>
    </div>
    `
}
