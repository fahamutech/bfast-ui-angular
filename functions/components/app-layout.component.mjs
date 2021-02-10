import {appToolBarComponent} from "./toolbar.component.mjs";
import {sideNavComponent} from "./side-nav.component.mjs";
import {StorageUtil} from "../utils/storage.util.mjs";
import {AppUtil} from "../utils/app.util.mjs";
import {ModuleService} from "../services/module.service.mjs";

export const appLayoutComponent = async function (body, project, module) {
    async function getModules() {
        if (project) {
            const storage = new StorageUtil();
            const appUtil = new AppUtil();
            const moduleService = new ModuleService(storage, appUtil);
            const module = await moduleService.getModules(project);
            return module.modules.map(x => {
                return {
                    name: x,
                    resources: []
                }
            })
        } else {
            return [];
        }
    }

    return `
            <!doctype html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <title>Bfast::Ui</title>
              <base href="/">
            
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" rel="stylesheet">
              <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
              <link href="/assets/css/style.css" rel="stylesheet">
              <!-- Latest compiled and minified CSS -->
             <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css"
             integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">
            
              <meta name="theme-color" content="#0b2e13">
              <!--  <meta name="theme-color" content="#1976d2">-->
            </head>
                <body style="font-family: Roboto,serif">
                    <div class="main">
                       <aside class="${project ? 'side-nav' : 'side-nav-hide'}">
                            ${await sideNavComponent(project, module, await getModules())}
                       </aside>
                       <div class="${project ? 'main-side-nav' : 'main-full'}">
                            ${appToolBarComponent(project)}
                            <div class="container">
                                ${body}
                            </div>
                        </div>
                    </div>
                 <noscript>Please enable JavaScript to continue using this application.</noscript>
                 <script src="/assets/main.js"></script>
                 <!-- JavaScript Bundle with Popper -->
                 <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" 
                 integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" 
                 crossorigin="anonymous"></script>
                 <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js" 
                 integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx" 
                 crossorigin="anonymous"></script>
                </body>
            </html>
        `
};

