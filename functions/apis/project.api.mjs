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
