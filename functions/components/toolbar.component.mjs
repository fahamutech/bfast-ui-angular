export const appToolBarComponent = function (project) {
    return `
        <div class="shadow" style="z-index: 1000; position:sticky;top: 0;">
            <nav class="navbar navbar-expand navbar-light bg-light">
              <div class="container-fluid">
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                 data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" 
                 aria-expanded="false" aria-label="Toggle navigation">
                  <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                  <div class="navbar-nav">
                    <a class="nav-link active" aria-current="page" href="/project">Projects</a>
                    <a style="display: none" id="moduleNav" class="nav-link active" 
                    aria-current="page" href="/project/${project}/modules">Modules</a>
                  </div>
                  <span style="flex: 1 1 auto"></span>
                  <button style="display: none" id="openTerminal" class="btn btn-outline-primary" onclick="openT('${project}')">Open Terminal</button>
                  <button style="display: none" id="closeTerminal" class="btn btn-outline-danger" onclick="closeT('${project}')">Close Terminal</button>
                </div>
              </div>
            </nav>
            <script>
                const name = "${project}"
                if (name && name.toString()!== "null" && name.toString()!== "undefined") {
                    document.getElementById('moduleNav').setAttribute('style', 'display: block');
                }
               
                const dontShow = name === 'null' || name === 'undefined';
                // console.log(dontShow);
                if (dontShow) {
                    document.getElementById('closeTerminal').removeAttribute('style');
                    document.getElementById('openTerminal').removeAttribute('style');
                    
                    document.getElementById('closeTerminal').style.display = 'none';
                    document.getElementById('openTerminal').style.display = 'none';
                }
                function _checkTButtons(){
                    if (dontShow){
                        return;
                    }
                    if (terminalIsOpen && terminalIsOpen()){
                        document.getElementById('openTerminal').style.display = 'none';
                        document.getElementById('terminal').style.height = '200px';
                        document.getElementById('closeTerminal').removeAttribute('style');
                    }else {
                        document.getElementById('closeTerminal').style.display = 'none';
                        document.getElementById('terminal').style.height = '0';
                        document.getElementById('openTerminal').removeAttribute('style');
                    }
                }
                const openT = function (project){
                    startTerminal(project);
                    _checkTButtons();
                }
                const closeT = function (project){
                    closeTerminal(project);
                    _checkTButtons();
                }
               const _intv = setInterval(_ => {
                    _checkTButtons();
                    clearInterval(_intv);
                  }, 200);
            </script>
        </div>
    `
}
