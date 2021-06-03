import {ProjectService} from "../../functions/services/project.service.mjs";
import {StorageUtil} from "../mocks/storage.util.mjs";

describe('Project Service Intergration Test', function () {
    const projectService = new ProjectService(new StorageUtil());
    it('should ensure project folder exist', function () {
        projectService.ensureBaseProjectFolder('/fuck').then(console.log).catch(console.log);
    });
});
