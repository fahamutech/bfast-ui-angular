import {errorMessageComponent} from "./error-message.component.mjs";
import {moduleInjectionsTableComponent} from "./module-injections-table.component.mjs";
import {moduleExportsTableComponent} from "./module-exports-table.component.mjs";
import {moduleImportsTableComponent} from "./module-imports-table.component.mjs";
import {moduleRoutesTableComponent} from "./module-routes-table.component.mjs";

/**
 *
 * @param error - {Error}
 * @param moduleName - {string}
 * @param project - {string} project name
 * @param mainModuleContents - {string} project main module contents
 * @param injections {Array<*>}
 * @param services {Array<*>}
 * @param exports
 * @param components
 * @param imports
 * @param modules
 * @param routes
 * @param pages
 * @param guards
 * @returns {string}
 */
export const moduleViewResources = async function (
    error, moduleName, project, mainModuleContents,
    injections = [], services = [], exports = [], components = [],
    imports = [],
    modules = [],
    routes = [],
    pages = [],
    guards = []) {
    return `
            <div class="container col-xl-9 col-lg-9 col-sm-12 col-md-10 col-9" style="margin-top: 24px">
                ${errorMessageComponent(error)}
                <div class="d-flex flex-row">
                     <h2>${moduleName} module</h2>
                     <span style="flex: 1 1 auto"></span>
                     <a href="/project/${project}/modules/${moduleName}/resources/constructor">
                        <button class="btn btn-primary btn-sm">Update Constructor</button>
                     </a>
                </div>
                <hr>
                <h2>Resources</h2>
                <div class="d-flex flex-row flex-wrap">
                    <div class="resource-card">
                        <a href="/project/${project}/modules/${moduleName}/resources/components">
                            <span style="font-size: 26px">Components</span>
                        </a>
                    </div>
                    
                    <div class="resource-card">
                        <a href="/project/${project}/modules/${moduleName}/resources/pages">
                            <span style="font-size: 26px">Pages</span>
                        </a>
                    </div>
                    
                    <div class="resource-card">
                        <a href="/project/${project}/modules/${moduleName}/resources/services">
                            <span style="font-size: 26px">Services</span>
                        </a>
                    </div>
                    
                    <div class="resource-card">
                        <a href="/project/${project}/modules/${moduleName}/resources/states">
                            <span style="font-size: 26px">States</span>
                        </a>
                    </div>
                    
                    <div class="resource-card">
                        <a href="/project/${project}/modules/${moduleName}/resources/guards">
                            <span style="font-size: 26px">Guards</span>
                        </a>
                    </div>
                    
                    <div class="resource-card">
                        <a href="/project/${project}/modules/${moduleName}/resources/models">
                            <span style="font-size: 26px">Models</span>
                        </a>
                    </div>
                    
                    <div class="resource-card">
                        <a href="/project/${project}/modules/${moduleName}/resources/styles">
                            <span style="font-size: 26px">Styles</span>
                        </a>
                    </div>
                </div>
                <hr>
                ${await moduleRoutesTableComponent(project, moduleName, routes, pages, guards)}
                <hr>
                ${await moduleInjectionsTableComponent(project, moduleName, injections, services)}
                <hr>  
                ${await moduleExportsTableComponent(project, moduleName, exports, components)}
                <hr>
                ${await moduleImportsTableComponent(project, moduleName, imports, modules)}
<!--                <div class="d-flex flex-row" style="align-items: center; margin: 8px 0">-->
<!--                    <h2 style="margin: 0">${moduleName}.module.ts</h2>-->
<!--                    <span style="flex: 1 1 auto"></span>-->
<!--                    <button id="saveCode" onclick="reload()" class="btn btn-primary">Reload</button>-->
<!--                    <div style="display: none" id="saveProgress" class="spinner-border text-primary" role="status">-->
<!--                      <span class="visually-hidden">Loading...</span>-->
<!--                    </div>-->
<!--                </div>-->
<!--                -->
<!--                <div style="height: 80vh" id="moduleCode"></div>-->
<!--                <script src="/assets/editor/min/vs/loader.js"></script>-->
<!--                <script>-->
<!--                    function reload(){-->
<!--                        location.reload();-->
<!--                    }-->
<!--                    function saveCode(){-->
<!--                        // document.getElementById('saveProgress').setAttribute('style','display:block');-->
<!--                        // document.getElementById('saveCode').setAttribute('style','display:none');-->
<!--                        // const code = editor.getValue();-->
<!--                        // fetch('/module', {-->
<!--                        //     method: 'POST',-->
<!--                        //     headers: {-->
<!--                        //         'content-type': 'application/json'-->
<!--                        //     },-->
<!--                        //     body: JSON.stringify({-->
<!--                        //         code: code-->
<!--                        //     })-->
<!--                        // }).then(value => {-->
<!--                        //     if ()-->
<!--                        //     return value.json()-->
<!--                        // }).then(value => {-->
<!--                        //     console.log(value);-->
<!--                        // }).catch(reason => {-->
<!--                        //     console.log(reason);-->
<!--                        // }).finally(() => {-->
<!--                        //     document.getElementById('saveProgress').setAttribute('style','display:none');-->
<!--                        //     document.getElementById('saveCode').setAttribute('style','display:block');-->
<!--                        // });-->
<!--                    }-->
<!--                    require.config({ paths: { vs: '/assets/editor/min/vs' } });-->
<!--                    let  editor;-->
<!--                    require(['vs/editor/editor.main'], function () {-->
<!--                    editor = monaco.editor.create(document.getElementById('moduleCode'), {-->
<!--                        value: ${JSON.stringify(mainModuleContents)},-->
<!--                        language: 'typescript',-->
<!--                        theme: 'vs-dark',-->
<!--                        readOnly: true-->
<!--                        });-->
<!--                     document.getElementById('saveCode').setAttribute('style','display:block');-->
<!--                    });-->
<!--                </script>-->
      </div>
<!-- -->        
`
}
