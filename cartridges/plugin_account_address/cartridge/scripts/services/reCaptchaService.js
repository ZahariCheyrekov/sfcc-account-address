"use strict";

const SERVICE_NAME = "http.reCAPTCHA.verify";
const LocalServiceRegistry = require("dw/svc/LocalServiceRegistry");

const reCaptchaService = LocalServiceRegistry.createService(SERVICE_NAME, {
    createRequest(svc, args) {
        svc.addHeader("Content-Type", "application/x-www-form-urlencoded");
        svc.setRequestMethod("POST");

        const secret = encodeURIComponent(args.secret);
        const token = encodeURIComponent(args.token);

        return `secret=${secret}&response=${token}`;
    },
    parseResponse(svc, client) {
        let result;

        try {
            result = JSON.parse(client.text);
        } catch (e) {
            result = client.text;
        }

        return result;
    },
    filterLogMessage(msg) {
        return msg;
    },
});

module.exports = reCaptchaService;
