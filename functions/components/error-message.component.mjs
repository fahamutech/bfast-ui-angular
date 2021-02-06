/**
 *
 * @param error - {string} message to show
 * @returns {string} html to render
 */
export const errorMessageComponent = function (error) {
    if (error && error !== 'undefined' && error !== 'null') {
        return `
                <div class="alert alert-danger alert-dismissible fade show" role="alert" style="padding: 16px; width: 100%">
                    ${error}
                    <button type="button" class="btn-close close" data-dismiss="alert"
                        data-bs-dismiss="alert" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                </div>
<!--                <div class="alert alert-danger alert-dismissible fade show" role="alert">-->
<!--                  <strong>Holy guacamole!</strong> You should check in on some of those fields below.-->
<!--                  <button type="button" class="close" data-dismiss="alert" aria-label="Close">-->
<!--                    <span aria-hidden="true">&times;</span>-->
<!--                  </button>-->
<!--                </div>-->
            `
    } else {
        return ''
    }
}
