import bfastnode from 'bfastnode';
import {ComponentsPage} from "../pages/components.page.mjs";
import {ComponentService} from "../services/component.service.mjs";
import {StorageUtil} from "../utils/storage.util.mjs";
import {AppUtil} from "../utils/app.util.mjs";
import {StylesService} from "../services/styles.service.mjs";
import {StateService} from "../services/state.service.mjs";

const {bfast} = bfastnode;

const storage = new StorageUtil();
const appUtil = new AppUtil();
const componentService = new ComponentService(storage, appUtil);
const styleService = new StylesService(storage, appUtil);
const stateService = new StateService(storage, appUtil);
const componentsPage = new ComponentsPage(componentService, styleService, stateService);

export const viewModuleComponents = bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/components',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        componentsPage.indexPage(project, module).then(value => {
            response.send(value);
        }).catch(_ => {
            response.status(400).send(_);
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
                console.log(_);
                response.status(400).send(_);
            });
        } else {
            componentsPage.viewComponentPage(project, module,).then(value => {
                response.send(value);
            }).catch(_ => {
                console.log(_)
                response.status(400).send(_);
            });
        }
    }
);

export const updateComponentTemplate1 = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/template',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const selectedComponent = request.params.component;
        componentsPage.updateTemplatePage(project, module, selectedComponent, request.query.error).then(value => {
            response.send(value)
        }).catch(_ => {
            response.status(400).send(_);
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
        componentService.deleteMethod(project, module, component, method).then(_ => {
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`);
        }).catch(reason => {
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())}`);
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
        componentService.addInjection(project, module, component, injection).then(_ => {
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`);
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())}`);
        });
    }
);

export const addInjectionManualInAComponentSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/injections',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        const body = JSON.parse(JSON.stringify(request.body));
        componentService.addInjectionFromExternalLib(project, module, component, body.name).then(async _ => {
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`);
        }).catch(reason => {
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`);
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
        componentService.deleteInjection(project, module, component, injection).then(_ => {
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`)
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())}`);
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
        componentService.addStyle(project, module, component, style).then(_ => {
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`);
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())}`)
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
        componentService.deleteStyle(project, module, component, style).then(_ => {
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`);
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())}`);
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
        componentService.addField(project, module, component, field).then(_ => {
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`);
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())}`);
        });
    }
);

export const deleteFieldInAComponentSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/fields/:field/delete',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        const field = decodeURIComponent(request.params.field);
        componentService.deleteField(project, module, component, field).then(_ => {
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`);
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())}`);
        });
    }
);

export const addExternalLibToComponent = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/imports',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        const body = JSON.parse(JSON.stringify(request.body));
        if (body && body.name && body.ref && body.type) {
            componentService.addImport(project, module, component, {
                name: body.name,
                type: body.type,
                ref: body.ref
            }).then(async _ => {
                response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`);
            }).catch(reason => {
                console.log(reason);
                response.redirect(`/project/${project}/modules/${module}/resources/components/${component}s?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`);
            });
        } else {
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent('name and ref attribute in a body is required')})`);
        }
    }
);

export const removeExternalLibToComponent = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/imports/:name/delete',
    (request, response) => {
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        const name = decodeURIComponent(request.params.name);
        componentService.componentFileToJson(project, module, component).then(async value => {
            if (value && value.imports && Array.isArray(value.imports)) {
                value.imports = value.imports.filter(x => x.name.toString().toLowerCase()
                    !== name.toString().trim().toLowerCase());
                await componentService.jsonToComponentFile(value, project, module);
            }
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`);
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`);
        });
    }
);
