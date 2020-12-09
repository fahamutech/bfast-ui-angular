/**
 *
 * @param modules - {Array<string>}
 * @param projectName - {string}
 * @returns {string}
 */
exports.moduleListComponent = function (modules, projectName) {
    let lists = '';
    for (const module of modules) {
        lists += (`
                <div class="d-flex resource-card">
                   <a style="text-underline: none; font-size: 26px" 
                   href="/project/${projectName}/module/view/${module}">${module}</a>
                </div>
            `);
    }
    return lists;
}
