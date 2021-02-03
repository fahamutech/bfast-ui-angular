import bfastnode from 'bfastnode'
import {ComponentsPage} from "../pages/components.page.mjs";
import {ComponentService} from "../services/component.service.mjs";
import {StorageUtil} from "../utils/storage.util.mjs";
import {ModuleService} from "../services/module.service.mjs";

export const viewModuleComponents = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/components',
    (request, response) => {
        const componentService = new ComponentService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        new ComponentsPage(componentService).indexPage(project, module).then(value => {
            response.send(value);
        }).catch(_ => {
            response.status(400).send(_);
        });
    }
);

export const createModuleComponents = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/components',
    (request, response) => {
        const componentService = new ComponentService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const body = JSON.parse(JSON.stringify(request.body));

        function componentPage(error = null) {
            new ComponentsPage(componentService).indexPage(project, module, error).then(value => {
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
        const componentComponent = new ComponentService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const selectedComponent = request.params.component;
        if (selectedComponent) {
            new ComponentsPage(componentComponent).viewComponentPage(project, module, selectedComponent, request.query.error).then(value => {
                response.send(value);
            }).catch(_ => {
                console.log(_)
                response.status(400).send(_);
            });
        } else {
            new ComponentsPage(componentComponent).viewComponentPage(project, module,).then(value => {
                response.send(value);
            }).catch(_ => {
                console.log(_)
                response.status(400).send(_);
            });
        }
    }
);

export const updateComponentTemplate = bfastnode.bfast.functions().onGetHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/template',
    [
        (request, response, next) => {
            const componentService = new ComponentService(new StorageUtil());
            const project = request.params.project;
            const module = request.params.module;
            const selectedComponent = request.params.component;
            new ComponentsPage(componentService).updateTemplatePage(project, module, selectedComponent, request.query.error).then(value => {
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
                // console.log(value);
                response.send(request.body._results);
            }).catch(reason => {
                console.log(reason);
                response.status(400).send(reason);
            });
        }
    ]
);

export const updateComponentTemplateSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/template',
    (request, response) => {
        const componentService = new ComponentService(new StorageUtil());
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
        const componentComponent = new ComponentService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        new ComponentsPage(componentComponent).createMethodPage(project, module, component, {
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
        const componentComponent = new ComponentService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        const body = JSON.parse(JSON.stringify(request.body));
        componentComponent.addMethod(project, module, component, {
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
        const componentComponent = new ComponentService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        const method = request.params.method;
        return new ComponentsPage(componentComponent).updateMethodPage(project, module, component, method).then(value => {
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
        const componentComponent = new ComponentService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        const method = request.params.method;
        const body = JSON.parse(JSON.stringify(request.body));
        componentComponent.updateMethod(project, module, component, method, {
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
        const componentComponent = new ComponentService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        const method = request.params.method;
        //  const body = JSON.parse(JSON.stringify(request.body));
        componentComponent.deleteMethod(project, module, component, method).then(_ => {
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`);
        }).catch(reason => {
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())}`);
        });
    }
);

export const addInjectionInAComponentSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/injections/:injection',
    (request, response) => {
        const componentComponent = new ComponentService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        const injection = request.params.injection;
        componentComponent.componentFileToJson(project, module, component).then(async value => {
            if (value && value.injections && Array.isArray(value.injections)) {
                const exist = value.injections.filter(x => x.state.toString().toLowerCase()
                    === injection.toString().split('.')[0].toLowerCase());
                if (exist.length === 0) {
                    value.injections.push({
                        name: injection.toString().split('.')[0].toString().toLowerCase() + 'State'.trim(),
                        state: injection.toString().split('.')[0].toString().toLowerCase().trim()
                    });
                    await componentComponent.jsonToComponentFile(value, project, module)
                }
            }
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`);
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        });
    }
);

export const deleteInjectionInAComponentSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/injections/:injection/delete',
    (request, response) => {
        const componentComponent = new ComponentService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        const injection = request.params.injection;
        componentComponent.componentFileToJson(project, module, component).then(async value => {
            if (value && value.injections && Array.isArray(value.injections)) {
                value.injections = value.injections.filter(x => x.state.toString().toLowerCase()
                    !== injection.toString().split('.')[0].toLowerCase());
                await componentComponent.jsonToComponentFile(value, project, module)
            }
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`)
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        });
    }
);

export const addStyleInAComponentSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/styles/:style',
    (request, response) => {
        const componentComponent = new ComponentService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        const style = request.params.style;
        componentComponent.componentFileToJson(project, module, component).then(async value => {
            if (value && value.styles && Array.isArray(value.styles)) {
                const exist = value.styles.filter(x => x.toString().toLowerCase()
                    === style.toString().split('.')[0].toLowerCase());
                if (exist.length === 0) {
                    value.styles.push(style.toString().split('.')[0]);
                    await componentComponent.jsonToComponentFile(value, project, module);
                }
            }
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`);
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        });
    }
);

export const deleteStyleInAComponentSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/styles/:style/delete',
    (request, response) => {
        const componentComponent = new ComponentService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        const style = request.params.style;
        componentComponent.componentFileToJson(project, module, component).then(async value => {
            if (value && value.styles && Array.isArray(value.styles)) {
                value.styles = value.styles.filter(x => x.toString().toLowerCase()
                    !== style.toString().split('.')[0].toLowerCase());
                await componentComponent.jsonToComponentFile(value, project, module)
            }
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`)
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        });
    }
);

export const addFieldInAComponentSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/fields',
    (request, response) => {
        const componentComponent = new ComponentService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        const body = JSON.parse(JSON.stringify(request.body));
        const field = body.name;
        componentComponent.componentFileToJson(project, module, component).then(async value => {
            if (value && value.components && Array.isArray(value.components)) {
                const exist = value.components.filter(x => x.component.toString().toLowerCase()
                    === field.toString().trim());
                if (exist.length === 0) {
                    value.components.push({
                        name: field.toString().trim(),
                        component: field.toString().trim(),
                        type: 'BehaviorSubject'
                    });
                    await componentComponent.jsonToComponentFile(value, project, module)
                }
            }
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`)
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        });
    }
);

export const deleteFieldInAComponentSubmit = bfastnode.bfast.functions().onPostHttpRequest(
    '/project/:project/modules/:module/resources/components/:component/fields/:field/delete',
    (request, response) => {
        const componentComponent = new ComponentService(new StorageUtil());
        const project = request.params.project;
        const module = request.params.module;
        const component = request.params.component;
        const field = request.params.field;
        componentComponent.componentFileToJson(project, module, component).then(async value => {
            if (value && value.components && Array.isArray(value.components)) {
                value.components = value.components.filter(x => x.component.toString().toLowerCase()
                    !== field.toString().trim());
                await componentComponent.jsonToComponentFile(value, project, module)
            }
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}`)
        }).catch(reason => {
            console.log(reason);
            response.redirect(`/project/${project}/modules/${module}/resources/components/${component}?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())})`)
        });
    }
);
