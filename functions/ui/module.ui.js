class ModuleUi {

    /**
     *
     * @param error - {Error}
     * @param modules - {Array<string>}
     * @param appName - {string} project name
     * @param mainModuleContents - {string} project main module contents
     * @returns {string}
     */
    availableModule(error, modules, appName, mainModuleContents) {
        return `
            <div class="container col-xl-9 col-lg-9 col-sm-12 col-md-10 col-9" style="margin-top: 24px">
            
                ${this.showErrorMessage(error)}
               
                <h2>Modules</h2>
                
                <div class="d-flex flex-row flex-wrap">
                    ${this.listModule(modules)}
                
                    <div style="width: 200px; height: 200px; border-radius: 5px; 
                        background: #f5f5f5; margin: 5px; display: flex; justify-content: center; align-items: center;
                        cursor: pointer">
                        <a href="/module/create">
                            <span style="font-size: 100px">+</span>
                        </a>
                    </div>
                </div>
                
                <hr>
                
                <div class="d-flex flex-row" style="align-items: center; margin: 8px 0">
                    <h2 style="margin: 0">${appName}.module.ts</h2>
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
                        fetch('/module', {
                            method: 'POST',
                            headers: {
                                'content-type': 'application/json'
                            },
                            body: JSON.stringify({
                                code: code
                            })
                        }).then(value => {
                            return value.json()
                        }).then(value => {
                            console.log(value);
                        }).catch(reason => {
                            console.log(reason);
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

    /**
     *
     * @param modules - {Array<string>}
     * @returns {string}
     */
    listModule(modules) {
        let lists = '';
        for (const module of modules) {
            lists += (`
                <div style="width: 200px; height: 200px; border-radius: 5px; background: #f5f5f5; margin: 5px;
                cursor: pointer;
                 justify-content: center; align-items: center" class="d-flex">
                   <a href="/module/view/${module}">${module}</a>
                </div>
            `);
        }
        return lists;
    }

    createModule(error) {
        return `
            <div style="margin-top: 24px;" class="container col-9">
                ${this.showErrorMessage(error)}
                <form class="form" action="/module/create" method="post" enctype="application/json">
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
        `
    }

    showErrorMessage(error) {
        if (error) {
            return `
                <div class="alert alert-danger alert-dismissible fade show" role="alert" style="padding: 16px; width: 100%">
                    ${error}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `
        } else {
            return ''
        }
    }
}


module.exports = {
    ModuleUi: ModuleUi
}
