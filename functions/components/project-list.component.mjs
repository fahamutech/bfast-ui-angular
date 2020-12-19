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
                    Add Project
<!--                <input id="chooseProject" hidden type="file" accept=".ts"/>-->
                </button>
            </div>
            <hr>
            ${projectListRecentComponent(projects)}
            ${newProjectModal()}
<!--            <script>-->
<!--                 function chooseProject(){-->
<!--                     document.getElementById('chooseProject').click();-->
<!--                     document.getElementById('chooseProject').onchange = function (ev){-->
<!--                         console.log(ev.target.files[0]);-->
<!--                     }-->
<!--                 }-->
<!--            </script>-->
        </div>
    `;
}

function newProjectModal() {
    return `
    <!-- Modal -->
    <div class="modal fade" id="addProjectModal" data-backdrop="static" data-keyboard="false" tabindex="-1"
     aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">Add Project</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form action="/project" method="post">
                 <div>
                    <label class="form-label">Name</label>
                    <input placeholder="project name" name="name" type="text" class="form-control">
                 </div>
                 <div>
                    <label class="form-label">Main Module</label>
                    <input placeholder="main module name" name="module" type="text" class="form-control">
                 </div>
                 <div>
                    <label class="form-label">Path</label>
                    <input placeholder="project path" name="projectPath" type="text" class="form-control">
                 </div>
                 <div style="padding: 8px 0">
                    <button type="submit" class="btn btn-primary btn-block">Save</button>
                 </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    `
}
