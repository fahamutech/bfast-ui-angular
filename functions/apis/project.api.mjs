import {StorageUtil} from "../utils/storage.util.mjs";
import {ProjectService} from "../services/project.service.mjs";
import {ProjectPage} from "../pages/project.page.mjs";
import bfastnode from "bfastnode";

export const projectAll = bfastnode.bfast.functions().onGetHttpRequest('/project',
    (request, response) => {
        const projectService = new ProjectService(new StorageUtil());
        new ProjectPage(projectService).indexPage(request.query.error).then(value => {
            response.send(value);
        }).catch(reason => {
            response.send(reason);
        });
    }
);

export const projectAdd = bfastnode.bfast.functions().onPostHttpRequest('/project',
    (request, response) => {
        const projectService = new ProjectService(new StorageUtil());
        const body = JSON.parse(JSON.stringify(request.body));
        if (body && body.name && body.module && body.projectPath && body.name !== '' && body.module !== '' && body.projectPath !== '') {
            projectService.addProject(body).then(_ => {
                response.redirect('/project');
            }).catch(reason => {
                response.redirect(`/project?error=${encodeURIComponent(reason && reason.message ? reason.message : reason.toString())}`);
            });
        } else {
            response.redirect(`/project?error=${encodeURIComponent('fill all require fields')}`);
        }
    }
);

export const projectDelete = bfastnode.bfast.functions().onPostHttpRequest('/project/:project/delete',
    (request, response) => {
        const projectService = new ProjectService(new StorageUtil());
        const project = request.params.project;
        projectService.deleteProject(project).then(_ => {
            response.redirect('/project');
        }).catch(reason => {
            response.redirect('/project?error=' + encodeURIComponent(reason && reason.message ? reason.message : reason.toString()))
        })
    }
);
