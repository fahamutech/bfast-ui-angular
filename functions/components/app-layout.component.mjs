import {appToolBarComponent} from "./toolbar.component.mjs";

export const appLayoutComponent = function (body, projectName) {
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
              <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css"
               rel="stylesheet" integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous">
            
            
              <meta name="theme-color" content="#0b2e13">
              <!--  <meta name="theme-color" content="#1976d2">-->
            </head>
            <body style="font-family: Roboto,serif">
                <div>
                    ${appToolBarComponent(projectName)}
                    <div class="container">
                        ${body}
                    </div>
                </div>
                <noscript>Please enable JavaScript to continue using this application.</noscript>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/js/bootstrap.bundle.min.js"
                 integrity="sha384-ygbV9kiqUc6oa4msXn9868pTtWMgiQaeYH7/t7LECLbyPA2x65Kgf80OJFdroafW" crossorigin="anonymous"></script>
                 <script src="/assets/main.js"></script>
            </body>
            </html>
        `
};

