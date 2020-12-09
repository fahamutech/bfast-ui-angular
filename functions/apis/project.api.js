const {StorageUtil} = require("../utils/storage.util");
const {ProjectService} = require("../services/project.service");
const {ProjectPage} = require("../pages/project.page");
const {bfast} = require("bfastnode");

exports.projectAll = bfast.functions().onGetHttpRequest('/project',
    (request, response) => {
        const projectService = new ProjectService(new StorageUtil());
        new ProjectPage(projectService).index(request.query.error).then(value => {
            response.send(value);
        }).catch(reason => {
            response.send(reason);
        });
    }
);
