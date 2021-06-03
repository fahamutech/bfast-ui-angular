import {StorageUtil} from "../utils/storage.util.mjs";
import {ProjectService} from "../services/project.service.mjs";
import {ProjectPage} from "../pages/project.page.mjs";
import bfastnode from "bfastnode";
import {AppUtil} from "../utils/app.util.mjs";

const {bfast} = bfastnode;
const appUtil = new AppUtil();
const projectService = new ProjectService(new StorageUtil());

function _addProject(name, module, path, response) {
    projectService.addProject({
        name: name,
        module: module,
        projectPath: path
    }).then(_ => {
        response.redirect(`/project/${name}/modules`);
    }).catch(reason => {
        response.redirect(`/project?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())}`);
    });
}

export const projectAll = bfast.functions().onGetHttpRequest('/project',
    (request, response) => {
        const name = request.query.name;
        const module = request.query.module;
        const path = request.query.path;
        if (name && module && path && name !== '' && module !== '' && path !== '') {
            _addProject(appUtil.camelCaseToKebal(name).toLowerCase(), module, path, response);
        } else {
            new ProjectPage(projectService).indexPage(request.query.error).then(value => {
                response.send(value);
            }).catch(reason => {
                console.log(reason);
                response.send(reason);
            });
        }
    }
);

export const projectAdd = bfast.functions().onPostHttpRequest('/project',
    (request, response) => {
        const body = JSON.parse(JSON.stringify(request.body));
        if (body && body.name && body.module && body.projectPath && body.name !== '' && body.module !== '' && body.projectPath !== '') {
            _addProject(appUtil.camelCaseToKebal(body.name).toLowerCase(), body.module, body.projectPath, response);
        } else {
            response.redirect(`/project?error=${encodeURIComponent('fill all require fields')}`);
        }
    }
);

export const projectDelete = bfast.functions().onPostHttpRequest('/project/:project/delete',
    (request, response) => {
        const project = request.params.project;
        projectService.deleteProject(project).then(_ => {
            response.redirect('/project');
        }).catch(reason => {
            response.redirect('/project?error=' + encodeURIComponent(reason && reason.message ? reason.message : reason.toString()))
        })
    }
);


export const projectCreate = bfast.functions().onPostHttpRequest('/project/create',
    (request, response) => {
        const body = JSON.parse(JSON.stringify(request.body));
        if (body && body.name && body.name !== '') {
            projectService.createProject(body.name).then(_name => {
                response.redirect(`/project/${_name}/modules`);
            }).catch(reason => {
                response.redirect(`/project?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())}`);
            });
        } else {
            response.redirect(`/project?error=${encodeURIComponent('fill all require fields')}`);
        }
    }
);
