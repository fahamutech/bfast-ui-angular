export const projectListRecentComponent = function (projects) {
    let list = '';
    for (const project of projects) {
        list += `
        <div class="d-flex flex-row align-items-center" style="margin-bottom: 5px">
            <a href="/project/${project.name}/modules" class="list-group-item list-group-item-action">
                <div>
                    <h5 style="margin: 0">${project.name}</h5>
                </div>
             </a>
             <form method="post" action="/project/${project.name}/delete">
                <button  type="submit" class="btn btn-outline btn-danger" style="margin: 0 4px">Remove</button>
             </form>
        </div>
        `
    }
    return `
      <div class="list-group">
          ${list}
       </div>
    `;
}
