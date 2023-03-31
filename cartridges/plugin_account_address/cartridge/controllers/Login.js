'use strict';

/**
 * @namespace Login
 */

const server = require('server');
server.extend(module.superModule);

const reCaptchaData = require("~/cartridge/scripts/middleware/reCaptchaData");

/**
 * Login-Show : This endpoint is called to load the Login page and attach the reCAPTHCA data
 * @name Base/Login-Show
 * @function
 * @memberof Login
 * @param {category} - sensitive
 * @param {serverfunction} - append
 */
server.append('Show', reCaptchaData.attachReCaptchaData);

module.exports = server.exports();
