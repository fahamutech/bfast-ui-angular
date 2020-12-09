exports.projectListRecentComponent = function (projects) {
    let list = '';
    for (const project of projects) {
        list += `
        <div class="d-flex flex-row">
            <a href="/project/${project.name}/module" class="list-group-item list-group-item-action">
                <div>
                    <h5 style="margin: 0">${project.name}</h5>
                </div>
             </a>
             <button class="btn btn-sm btn-outline btn-danger" style="margin: 0 4px">Remove</button>
        </div>
        `
    }
    return `
      <div class="list-group">
          ${list}
       </div>
    `;
}
