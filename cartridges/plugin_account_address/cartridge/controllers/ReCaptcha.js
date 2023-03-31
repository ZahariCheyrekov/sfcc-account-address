"use strict";

/**
 * @namespace ReCaptcha
 */

const server = require("server");
const reCaptcha = require('~/cartridge/scripts/middlewares/reCaptcha');

/**
 * ReCaptcha-Verify : This endpoint is called via ajax request when a reCAPTCHA token needs to be verified
 * @name Base/ReCaptcha-Verify
 * @function
 * @memberof ReCaptcha
 * @param {httpparameter} - token - reCAPTCHA response token
 * @param {middleware} - server.middleware.https
 * @param {middleware} - reCaptchaData.attachReCaptchaData
 * @param {category} - sensitive
 * @param {renders} - json
 * @param {serverfunction} - post
 */
server.post("Verify", server.middleware.https, reCaptcha.configureRecaptcha, function (req, res, next) {
    const Resource = require('dw/web/Resource');
    const errorMessage = Resource.msg('error.message.account.create.error', 'forms', null);

    const token = req.form.token;

    if (!token) {
        res.json({
            success: false,
            errorMessage
        });

        return next();
    }

    const reCaptchaConfiguration = res.getViewData().reCaptcha;

    const reCaptchaService = require('~/cartridge/scripts/services/reCaptchaService');
    const response = reCaptchaService.call(token, reCaptchaConfiguration.secretKey).object;

    const siteTreshold = reCaptchaConfiguration.threshold;

    if (response.score >= siteTreshold) {
        res.json({
            success: true
        });
    } else {
        res.json({
            success: false,
            errorMessage
        })
    }

    next();
});

module.exports = server.exports();
