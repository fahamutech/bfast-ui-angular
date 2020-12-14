export const appToolBarComponent = function (projectName) {
    return `
        <div class="shadow">
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
          <div class="container-fluid">
            <a class="navbar-brand" href="#">Bfast::UI</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
             data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" 
             aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
              <div class="navbar-nav">
                <a class="nav-link active" aria-current="page" href="/project">Projects</a>
                <a style="display: none" id="moduleNav" class="nav-link active" 
                aria-current="page" href="/project/${projectName}/module">Modules</a>
              </div>
            </div>
          </div>
        </nav>
        <script>
            const name = "${projectName}"
            if (name && name.toString()!== "null" && name.toString()!== "undefined") {
                document.getElementById('moduleNav').setAttribute('style', 'display: block');
            }
        </script>
    </div>
    `
}
