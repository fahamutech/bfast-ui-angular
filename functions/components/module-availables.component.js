const {errorMessageComponent} = require("./error-message.component");

/**
 *
 * @param error - {Error}
 * @param modules - {Array<string>}
 * @param appName - {string} project name
 * @param mainModuleContents - {string} project main module contents
 * @returns {string}
 */

const {moduleListComponent} = require("./module-list.component");

exports.moduleAvailablesComponent = function (error, modules, projectName, mainModuleContents) {
    return `
            <div class="container col-xl-9 col-lg-9 col-sm-12 col-md-10 col-9" style="margin-top: 24px">
            
                ${errorMessageComponent(error)}
               
                <h2>Modules</h2>
                
                <div class="d-flex flex-row flex-wrap">
                    ${moduleListComponent(modules, projectName)}
                
                    <div class="resource-card">
                        <a href="/project/${projectName}/module/create">
                            <span style="font-size: 60px">+</span>
                        </a>
                    </div>
                </div>
                
                <hr>
                
                <div class="d-flex flex-row" style="align-items: center; margin: 8px 0">
                    <h2 style="margin: 0">${projectName}.module.ts</h2>
                    <span style="flex: 1 1 auto"></span>
                    <button style="display: none" id="saveCode" onclick="saveCode()" class="btn btn-primary">Update</button>
                    <div style="display: none" id="saveProgress" class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
                
                <div style="height: 80vh" id="moduleCode"></div>
                <script src="/assets/editor/min/vs/loader.js"></script>
                <script>
                    function saveCode(){
                        document.getElementById('saveProgress').setAttribute('style','display:block');
                        document.getElementById('saveCode').setAttribute('style','display:none');
                        const code = editor.getValue();
                        fetch('/project/${projectName}/module', {
                            method: 'POST',
                            headers: {
                                'content-type': 'application/json'
                            },
                            body: JSON.stringify({
                                code: code
                            })
                        }).then(value => {
                           if (value.status !==200){
                               throw value.status + ' : ' + value.statusText.toString();
                           }else {
                               return value.json();
                           }
                        }).then(value=>{
                            console.log(value);
                        }).catch(reason => {
                            alert(reason);
                        }).finally(() => {
                            document.getElementById('saveProgress').setAttribute('style','display:none');
                            document.getElementById('saveCode').setAttribute('style','display:block');
                        });
                    }
                    require.config({ paths: { vs: '/assets/editor/min/vs' } });
                    let  editor;
                    require(['vs/editor/editor.main'], function () {
                    editor = monaco.editor.create(document.getElementById('moduleCode'), {
                        value: ${JSON.stringify(mainModuleContents)},
                        language: 'typescript',
                        theme: 'vs-dark'
                        });
                     document.getElementById('saveCode').setAttribute('style','display:block');
                    });
                </script>
            </div>
        `
}
