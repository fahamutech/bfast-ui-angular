/**
 *
 * @param error - {string} message to show
 * @returns {string} html to render
 */
exports.errorMessageComponent = function showErrorMessage(error) {
    if (error) {
        return `
                <div class="alert alert-danger alert-dismissible fade show" role="alert" style="padding: 16px; width: 100%">
                    ${error}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `
    } else {
        return ''
    }
}
