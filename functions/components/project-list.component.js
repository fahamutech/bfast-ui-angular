const {projectListRecentComponent} = require("./project-list-recent.component");
exports.projectListComponent = function (projects) {
    return `
        <div class="container col-xl-9 col-lg-9 col-sm-11 col-md-10" style="margin-top: 24px">
            <div class="d-flex fle-row">
                <h2>Recent</h2>
                <span style="flex:  1 1 auto"></span>
                <button class="btn btn-primary">
                Open Project
<!--                <input type="file" webkitdirectory directory multiple/>-->
                </button>
            </div>
            <hr>
            ${projectListRecentComponent(projects)}
        </div>
    `;
};
