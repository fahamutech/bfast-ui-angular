import bfastnode from 'bfastnode';
import {ComponentsPage} from "../pages/components.page.mjs";
import {ComponentService} from "../services/component.service.mjs";
import {StorageUtil} from "../utils/storage.util.mjs";
import {AppUtil} from "../utils/app.util.mjs";

const {bfast} = bfastnode;
bfast.init({
    functionsURL: `http://localhost:${process.env.DEV_PORT ? process.env.DEV_PORT : process.env.PORT}`,
    databaseURL: `http://localhost:${process.env.DEV_PORT ? process.env.DEV_PORT : process.env.PORT}`,
});
const syncEvent = bfast.functions().event(`/sync`);

const storage = new StorageUtil();
const appUtil = new AppUtil();
const componentService = new ComponentService(storage, appUtil);
const componentsPage = new ComponentsPage(componentService);

export const viewModuleComponents = bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/components',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        componentsPage.indexPage(project, module).then(value => {
            response.send(value);
        }).catch(_ => {
            response.status(400).send(_);
        }).finally(() => {
            syncEvent.emit({body: {project: project, module: module, type: 'child'}});
        });
    }
);

export const createModuleComponents = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/components',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const body = JSON.parse(JSON.stringify(request.body));
        function componentPage(error = null) {
            componentsPage.indexPage(project, module, error).then(value => {
                response.send(value);
            }).catch(_ => {
                response.status(400).send(_);
            });
        }
        if (body && body.name && body.name !== '') {
            const componentName = body.name.toString().toLowerCase();
            componentService.createComponent(project, module, componentName).then(_ => {
                componentPage();
            }).catch(reason => {
                componentPage(reason && reason.message ? reason.message : reason.toString());
            }).finally(() => {
                syncEvent.emit({body: {project: project, module: module, type: 'child'}});
            });
        } else {
            componentPage("Please enter valid component name");
        }
    }
);

export const viewModuleComponent = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/components/:component',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const selectedComponent = request.params.component;
        if (selectedComponent) {
            componentsPage.viewComponentPage(project, module, selectedComponent, request.query.error)
                .then(value => {
                    response.send(value);
                }).catch(_ => {
                console.log(_)
                response.status(400).send(_);
            }).finally(() => {
                syncEvent.emit({body: {project: project, module: module, type: 'child'}});
            });
        } else {
            componentsPage.viewComponentPage(project, module,).then(value => {
                response.send(value);
            }).catch(_ => {
                console.log(_)
                response.status(400).send(_);
            }).finally(() => {
                syncEvent.emit({body: {project: project, module: module, type: 'child'}});
            });
        }
    }
);

export const updateComponentTemplate1 = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/template',
    (request, response, next) => {
        const project = request.params.project;
        const module = request.params.module;
        const selectedComponent = request.params.component;
        componentsPage.updateTemplatePage(project, module, selectedComponent, request.query.error).then(value => {
            request.body._results = value;
            next();
        }).catch(_ => {
            response.status(400).send(_);
        }).finally(() => {
            //  syncEvent.emit({body: {project: project, module: module, type: 'child'}});
        });
    }
);

export const updateComponentTemplateSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/template',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const selectedComponent = request.params.component;
        const body = JSON.parse(JSON.stringify(request.body));
        if (body && body.code) {
            componentService.updateTemplate(project, module, selectedComponent, body.code).then(_ => {
                response.send({message: 'done update template'})
            }).catch(reason => {
                response.status(400).send(reason.toString());
            }).finally(() => {
                syncEvent.emit({body: {project: project, module: module, type: 'child'}});
            });
        } else {
            response.status(400).send("Please enter valid template html code");
        }
    }
);

export const createMethodInAComponent = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/method',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        componentsPage.createMethodPage(project, module, component, {
            name: request.query.name ? request.query.name : '',
            inputs: request.query.inputs ? request.query.inputs : '',
            body: request.query.codes,
            return: 'any'
        }, request.query.error).then(value => {
            response.send(value);
        }).catch(reason => {
            response.status(400).send(reason);
        }).finally(() => {
            syncEvent.emit({body: {project: project, module: module, type: 'child'}});
        });
    }
);

export const createMethodInAComponentSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/method',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        const body = JSON.parse(JSON.stringify(request.body));
        componentService.addMethod(project, module, component, {
            name: body.name,
            inputs: body.inputs,
            return: 'any',
            body: body.codes
        }).then(_ => {
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`);
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}/method?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())}&codes=${encodeURIComponent(body.codes)}&name=${encodeURIComponent(body.name)}&inputs=${encodeURIComponent(body.inputs)}`);
        }).finally(() => {
            syncEvent.emit({body: {project: project, module: module, type: 'child'}});
        });
    }
);

export const updateMethodInAComponent = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/method/:method',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        const method = request.params.method;
        return componentsPage.updateMethodPage(project, module, component, method).then(value => {
            response.send(value);
        }).catch(reason => {
            response.status(400).redirect(
                `/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent(reason && reason.message ? reason.message : '')}`
            );
        }).finally(() => {
            syncEvent.emit({body: {project: project, module: module, type: 'child'}});
        });
    }
);

export const updateMethodInAComponentSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/method/:method',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        const method = request.params.method;
        const body = JSON.parse(JSON.stringify(request.body));
        componentService.updateMethod(project, module, component, method, {
            name: body.name,
            inputs: body.inputs,
            return: 'any',
            body: body.codes
        }).then(_ => {
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`);
        }).catch(reason => {
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}/method/${method}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())}&codes=${encodeURIComponent(body.codes)}&name=${encodeURIComponent(body.name)}&inputs=${encodeURIComponent(body.inputs)}`);
        }).finally(() => {
            syncEvent.emit({body: {project: project, module: module, type: 'child'}});
        });
    }
);

export const deleteMethodInAComponentSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/method/:method/delete',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        const method = request.params.method;
        //  const body = JSON.parse(JSON.stringify(request.body));
        componentService.deleteMethod(project, module, component, method).then(_ => {
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`);
        }).catch(reason => {
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())}`);
        }).finally(() => {
            syncEvent.emit({body: {project: project, module: module, type: 'child'}});
        });
    }
);

export const addInjectionInAComponentSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/injections/:injection',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        const injection = request.params.injection;
        componentService.componentFileToJson(project, module, component).then(async value => {
            if (value && value.injections && Array.isArray(value.injections)) {
                const exist = value.injections.filter(x => x.state.toString().toLowerCase()
                    === injection.toString().split('.')[0].toLowerCase());
                if (exist.length === 0) {
                    value.injections.push({
                        name: injection.toString().split('.')[0].toString().toLowerCase() + 'State'.trim(),
                        state: injection.toString().split('.')[0].toString().toLowerCase().trim()
                    });
                    await componentService.jsonToComponentFile(value, project, module)
                }
            }
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`);
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        }).finally(() => {
            syncEvent.emit({body: {project: project, module: module, type: 'child'}});
        });
    }
);

export const deleteInjectionInAComponentSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/injections/:injection/delete',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        const injection = request.params.injection;
        componentService.componentFileToJson(project, module, component).then(async value => {
            if (value && value.injections && Array.isArray(value.injections)) {
                value.injections = value.injections.filter(x => x.state.toString().toLowerCase()
                    !== injection.toString().split('.')[0].toLowerCase());
                await componentService.jsonToComponentFile(value, project, module)
            }
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`)
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        }).finally(() => {
            syncEvent.emit({body: {project: project, module: module, type: 'child'}});
        });
    }
);

export const addStyleInAComponentSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/styles/:style',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        const style = request.params.style;
        componentService.componentFileToJson(project, module, component).then(async value => {
            if (value && value.styles && Array.isArray(value.styles)) {
                const exist = value.styles.filter(x => x.toString().toLowerCase()
                    === style.toString().split('.')[0].toLowerCase());
                if (exist.length === 0) {
                    value.styles.push(style.toString().split('.')[0]);
                    await componentService.jsonToComponentFile(value, project, module);
                }
            }
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`);
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        }).finally(() => {
            syncEvent.emit({body: {project: project, module: module, type: 'child'}});
        });
    }
);

export const deleteStyleInAComponentSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/styles/:style/delete',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        const style = request.params.style;
        componentService.componentFileToJson(project, module, component).then(async value => {
            if (value && value.styles && Array.isArray(value.styles)) {
                value.styles = value.styles.filter(x => x.toString().toLowerCase()
                    !== style.toString().split('.')[0].toLowerCase());
                await componentService.jsonToComponentFile(value, project, module)
            }
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`)
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        }).finally(() => {
            syncEvent.emit({body: {project: project, module: module, type: 'child'}});
        });
    }
);

export const addFieldInAComponentSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/fields',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        const body = JSON.parse(JSON.stringify(request.body));
        const field = body.name;
        if (field && field.toString().includes(':')) {
            componentService.componentFileToJson(project, module, component).then(async value => {
                if (value && value.fields && Array.isArray(value.fields)) {
                    const exist = value.fields.filter(
                        x =>
                            x.value.toString().toLowerCase().trim() === field.toString().toLowerCase().trim()
                    );
                    if (exist.length === 0) {
                        value.fields.push({
                            name: field.toString().split(':')[0].trim(),
                            value: field.toString().trim(),
                        });
                        await componentService.jsonToComponentFile(value, project, module)
                    }
                }
                response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`)
            }).catch(reason => {
                console.log(reason);
                response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
            }).finally(() => {
                syncEvent.emit({body: {project: project, module: module, type: 'child'}});
            });
        } else {
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent('Component field is bad formatted, must contain : to separate nam and type')}`)
        }
    }
);

export const deleteFieldInAComponentSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/fields/:field/delete',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        const field = decodeURIComponent(request.params.field);
        componentService.componentFileToJson(project, module, component).then(async value => {
            if (value && value.fields && Array.isArray(value.fields)) {
                value.fields = value.fields.filter(x => x.name.toString().toLowerCase().trim()
                    !== field.toString().toLowerCase().trim());
                await componentService.jsonToComponentFile(value, project, module);
            }
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`)
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        }).finally(() => {
            syncEvent.emit({body: {project: project, module: module, type: 'child'}});
        });
    }
);
