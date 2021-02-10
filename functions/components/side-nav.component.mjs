
export const sideNavComponent = async function (project, module, modules = []) {
    async function versionName() {
return '';
    }

    function getModuleMenus(_menus) {
        let menusEl = '';
        for (const menu of _menus) {
            menusEl += `
                <div class="">
              
                    <div class="card-header" style="background: #007bff0d" id="${menu.name}">
                      <h2 class="mb-0">
                        <a href="/project/${project}/modules/${menu.name}/resources" class="btn btn-link btn-block text-left" type="" data-toggle="" data-target="#${menu.name}" aria-expanded="true" aria-controls="${menu.name}">
                          ${menu.name}
                        </a>
                      </h2>
                    </div>
                
                    <div id="collapseOne" class="collapse ${module && module === menu.name ? 'show' : ''}" aria-labelledby="${menu.name}" data-parent="#accordionMenu">
                      <div class="card-body">
                        <div class="list-group">
                          <a href="/project/${project}/modules/${menu.name}/resources/components" style="border: none" class="list-group-item list-group-item-action">Components</a>
                          <a href="/project/${project}/modules/${menu.name}/resources/pages"  style="border: none" class="list-group-item list-group-item-action">Pages</a>
                          <a href="/project/${project}/modules/${menu.name}/resources/services"  style="border: none" class="list-group-item list-group-item-action">Services</a>
                          <a href="/project/${project}/modules/${menu.name}/resources/states"  style="border: none" class="list-group-item list-group-item-action">States</a>
                          <a href="/project/${project}/modules/${menu.name}/resources/guards"  style="border: none" class="list-group-item list-group-item-action">Guards</a>
                          <a href="/project/${project}/modules/${menu.name}/resources/models"  style="border: none" class="list-group-item list-group-item-action">Models</a>
                          <a href="/project/${project}/modules/${menu.name}/resources/styles"  style="border: none" class="list-group-item list-group-item-action">Styles</a>
                        </div>
                      </div>
                    </div>
                
              </div>
            `;
        }
        return menusEl;
    }

    return `
        <div class="side-nav-content">
            <div class="d-flex flex-column justify-content-center align-items-center" style="padding: 24px">
                <i style="font-size: 60px; width: 60px; height: 60px; color: #007bff" class="material-icons">receipt_long</i>
                <h3>${project}</h3>
            </div>
            <hr style="margin: 8px; padding: 0 16px">
            
            <div class="accordion" id="accordionMenu">
              ${getModuleMenus(modules)}
            </div>
            <div style="padding: 16px">
                ${await versionName()}
            </div>
       </div>
    `
}


