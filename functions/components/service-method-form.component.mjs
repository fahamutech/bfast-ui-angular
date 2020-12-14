export const serviceMethodCreateForm = function (project, module) {
    return `
        <div class="d-flex flex-row" style="margin: 8px 0">
             <h3 style="margin: 0">Create</h3>
        </div>
        <div class="shadow" style="padding: 8px">
            <form method="post" action="/project/${project}/module/${module}/services/create" class="form">
                <div>
                    <label>Name</label>
                    <input class="form-control" name="name" placeholder="enter service name" type="text">
                </div>
                <div>
                    <label>Module Name</label>
                    <input class="form-control" name="name" placeholder="name" type="text">
                </div>
            </form>
        </div>
    `
}
