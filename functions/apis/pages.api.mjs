import bfastnode from 'bfastnode'
import {PagesPage} from "../pages/pages.page.mjs";
import {PageService} from "../services/page.service.mjs";
import {StorageUtil} from "../utils/storage.util.mjs";
import {ModuleService} from "../services/module.service.mjs";

export const viewModulePages = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/pages',
    (request, response) => {
        const pageService = new PageService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        new PagesPage(pageService).indexPage(project, module).then(value => {
            response.send(value);
        }).catch(_ => {
            response.status(400).send(_);
        });
    }
);

export const createModulePages = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/pages',
    (request, response) => {
        const pageService = new PageService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const body = JSON.parse(JSON.stringify(request.body));

        function pagePage(error = null) {
            new PagesPage(pageService).indexPage(project, module, error).then(value => {
                response.send(value);
            }).catch(_ => {
                response.status(400).send(_);
            });
        }

        if (body && body.name && body.name !== '') {
            const pageName = body.name.toString().toLowerCase();
            pageService.createPage(project, module, pageName).then(_ => {
                pagePage();
            }).catch(reason => {
                pagePage(reason && reason.message ? reason.message : reason.toString());
            });
        } else {
            pagePage("Please enter valid page name");
        }
    }
);

export const viewModulePage = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/pages/:page',
    (request, response) => {
        const pagePage = new PageService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const selectedPage = request.params.page;
        if (selectedPage) {
            new PagesPage(pagePage).viewPagePage(project, module, selectedPage, request.query.error).then(value => {
                response.send(value);
            }).catch(_ => {
                console.log(_)
                response.status(400).send(_);
            });
        } else {
            new PagesPage(pagePage).viewPagePage(project, module,).then(value => {
                response.send(value);
            }).catch(_ => {
                console.log(_)
                response.status(400).send(_);
            });
        }
    }
);

export const updatePageTemplate = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/pages/:page/template',
    [
        (request, response, next) => {
            const pageService = new PageService(new StorageUtil());
            const project = request.params.project;
            const module = request.params.module;
            const selectedPage = request.params.page;
            new PagesPage(pageService).updateTemplatePage(project, module, selectedPage, request.query.error).then(value => {
                request.body._results = value;
                next();
            }).catch(_ => {
                response.status(400).send(_);
            });
        },
        // update module
        (request, response) => {
            const moduleService = new ModuleService(new StorageUtil());
            const project = request.params.project;
            const module = request.params.module;
            moduleService.moduleFileToJson(project, module).then(value => {
                return moduleService.moduleJsonToFile(project, module, value);
            }).then(value => {
                response.send(request.body._results);
            }).catch(reason => {
                console.log(reason);
                response.status(400).send(reason);
            });
        }
    ]
);

export const updatePageTemplateSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/pages/:page/template',
    (request, response) => {
        const pageService = new PageService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const selectedPage = request.params.page;
        const body = JSON.parse(JSON.stringify(request.body));
        if (body && body.code) {
            pageService.updateTemplate(project, module, selectedPage, body.code).then(_ => {
                response.send({message: 'done update template'})
            }).catch(reason => {
                response.status(400).send(reason.toString());
            });
        } else {
            response.status(400).send("Please enter valid template html code");
        }
    }
);

export const createMethodInAPage = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/pages/:page/method',
    (request, response) => {
        const pagePage = new PageService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const page = request.params.page;
        new PagesPage(pagePage).createMethodPage(project, module, page, {
            name: request.query.name ? request.query.name : '',
            inputs: request.query.inputs ? request.query.inputs : '',
            body: request.query.codes,
            return: 'any'
        }, request.query.error).then(value => {
            response.send(value);
        }).catch(reason => {
            response.status(400).send(reason);
        });
    }
);

export const createMethodInAPageSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/pages/:page/method',
    (request, response) => {
        const pagePage = new PageService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const page = request.params.page;
        const body = JSON.parse(JSON.stringify(request.body));
        pagePage.addMethod(project, module, page, {
            name: body.name,
            inputs: body.inputs,
            return: 'any',
            body: body.codes
        }).then(_ => {
            response.redirect(`/project/${project}/modules/${module}/resources/pages/${page}`);
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/pages/${page}/method?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())}&codes=${encodeURIComponent(body.codes)}&name=${encodeURIComponent(body.name)}&inputs=${encodeURIComponent(body.inputs)}`);
        });
    }
);

export const updateMethodInAPage = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/pages/:page/method/:method',
    (request, response) => {
        const pagePage = new PageService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const page = request.params.page;
        const method = request.params.method;
        return new PagesPage(pagePage).updateMethodPage(project, module, page, method).then(value => {
            response.send(value);
        }).catch(reason => {
            response.status(400).redirect(
                `/project/${project}/modules/${module}/resources/pages/${page}?error=${encodeURIComponent(reason && reason.message ? reason.message : '')}`
            );
        });
    }
);

export const updateMethodInAPageSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/pages/:page/method/:method',
    (request, response) => {
        const pagePage = new PageService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const page = request.params.page;
        const method = request.params.method;
        const body = JSON.parse(JSON.stringify(request.body));
        pagePage.updateMethod(project, module, page, method, {
            name: body.name,
            inputs: body.inputs,
            return: 'any',
            body: body.codes
        }).then(_ => {
            response.redirect(`/project/${project}/modules/${module}/resources/pages/${page}`);
        }).catch(reason => {
            response.redirect(`/project/${project}/modules/${module}/resources/pages/${page}/method/${method}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())}&codes=${encodeURIComponent(body.codes)}&name=${encodeURIComponent(body.name)}&inputs=${encodeURIComponent(body.inputs)}`);
        });
    }
);

export const deleteMethodInAPageSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/pages/:page/method/:method/delete',
    (request, response) => {
        const pagePage = new PageService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const page = request.params.page;
        const method = request.params.method;
        //  const body = JSON.parse(JSON.stringify(request.body));
        pagePage.deleteMethod(project, module, page, method).then(_ => {
            response.redirect(`/project/${project}/modules/${module}/resources/pages/${page}`);
        }).catch(reason => {
            response.redirect(`/project/${project}/modules/${module}/resources/pages/${page}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())}`);
        });
    }
);

export const addInjectionInAPageSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/pages/:page/injections/:injection',
    (request, response) => {
        const pagePage = new PageService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const page = request.params.page;
        const injection = request.params.injection;
        pagePage.pageFileToJson(project, module, page).then(async value => {
            if (value && value.injections && Array.isArray(value.injections)) {
                const exist = value.injections.filter(x => x.state.toString().toLowerCase()
                    === injection.toString().split('.')[0].toLowerCase());
                if (exist.length === 0) {
                    value.injections.push({
                        name: injection.toString().split('.')[0].toString().toLowerCase() + 'State'.trim(),
                        state: injection.toString().split('.')[0].toString().toLowerCase().trim()
                    });
                    await pagePage.jsonToPageFile(value, project, module)
                }
            }
            response.redirect(`/project/${project}/modules/${module}/resources/pages/${page}`);
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/pages/${page}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        });
    }
);

export const deleteInjectionInAPageSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/pages/:page/injections/:injection/delete',
    (request, response) => {
        const pagePage = new PageService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const page = request.params.page;
        const injection = request.params.injection;
        pagePage.pageFileToJson(project, module, page).then(async value => {
            if (value && value.injections && Array.isArray(value.injections)) {
                value.injections = value.injections.filter(x => x.state.toString().toLowerCase()
                    !== injection.toString().split('.')[0].toLowerCase());
                await pagePage.jsonToPageFile(value, project, module)
            }
            response.redirect(`/project/${project}/modules/${module}/resources/pages/${page}`)
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/pages/${page}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        });
    }
);

export const addStyleInAPageSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/pages/:page/styles/:style',
    (request, response) => {
        const pagePage = new PageService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const page = request.params.page;
        const style = request.params.style;
        pagePage.pageFileToJson(project, module, page).then(async value => {
            if (value && value.styles && Array.isArray(value.styles)) {
                const exist = value.styles.filter(x => x.toString().toLowerCase()
                    === style.toString().split('.')[0].toLowerCase());
                if (exist.length === 0) {
                    value.styles.push(style.toString().split('.')[0]);
                    await pagePage.jsonToPageFile(value, project, module);
                }
            }
            response.redirect(`/project/${project}/modules/${module}/resources/pages/${page}`);
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/pages/${page}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        });
    }
);

export const deleteStyleInAPageSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/pages/:page/styles/:style/delete',
    (request, response) => {
        const pagePage = new PageService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const page = request.params.page;
        const style = request.params.style;
        pagePage.pageFileToJson(project, module, page).then(async value => {
            if (value && value.styles && Array.isArray(value.styles)) {
                value.styles = value.styles.filter(x => x.toString().toLowerCase()
                    !== style.toString().split('.')[0].toLowerCase());
                await pagePage.jsonToPageFile(value, project, module)
            }
            response.redirect(`/project/${project}/modules/${module}/resources/pages/${page}`)
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/pages/${page}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        });
    }
);

export const addFieldInAPageSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/pages/:page/fields',
    (request, response) => {
        const pagePage = new PageService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const page = request.params.page;
        const body = JSON.parse(JSON.stringify(request.body));
        const field = body.name;
        pagePage.pageFileToJson(project, module, page).then(async value => {
            if (value && value.pages && Array.isArray(value.pages)) {
                const exist = value.pages.filter(x => x.page.toString().toLowerCase()
                    === field.toString().trim());
                if (exist.length === 0) {
                    value.pages.push({
                        name: field.toString().trim(),
                        page: field.toString().trim(),
                        type: 'BehaviorSubject'
                    });
                    await pagePage.jsonToPageFile(value, project, module)
                }
            }
            response.redirect(`/project/${project}/modules/${module}/resources/pages/${page}`)
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/pages/${page}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        });
    }
);

export const deleteFieldInAPageSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/pages/:page/fields/:field/delete',
    (request, response) => {
        const pagePage = new PageService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const page = request.params.page;
        const field = request.params.field;
        pagePage.pageFileToJson(project, module, page).then(async value => {
            if (value && value.pages && Array.isArray(value.pages)) {
                value.pages = value.pages.filter(x => x.page.toString().toLowerCase()
                    !== field.toString().trim());
                await pagePage.jsonToPageFile(value, project, module)
            }
            response.redirect(`/project/${project}/modules/${module}/resources/pages/${page}`)
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/pages/${page}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        });
    }
);