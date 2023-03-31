const createErrorNotification = require('base/components/errorNotification');

/**
 * It validates the given reCAPTCHA token upon submission
 * @param {String} token The given reCAPTCHA token
 */
function verifyReCaptcha(token) {
    const $form = $('form.js-registration');
    const $submitBtn = $form.find('.js-registration-submit');

    const verifyUrl = $submitBtn.data('verify-url');

    $form.spinner().start();

    $.ajax({
        url: verifyUrl,
        type: 'post',
        dataType: 'json',
        data: { token },
        success: function (data) {
            $form.spinner().stop();

            if (!data.success) {
                createErrorNotification($('.error-messaging'), data.errorMessage);
            } else {
                $form.trigger('submit');
            }
        },
        error: function (err) {
            $form.spinner().stop();
            createErrorNotification($('.error-messaging'), err.responseJSON.errorMessage);
        },
    });
}

function attachReCaptcha() {
    window.verifyReCaptcha = verifyReCaptcha;
}

module.exports = {
    attachReCaptcha,
};
