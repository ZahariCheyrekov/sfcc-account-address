'use strict';

/**
 * @namespace Account
 */

const server = require('server');
server.extend(module.superModule);

const csrfProtection = require('*/cartridge/scripts/middleware/csrf');

/**
 * Account-SubmitRegistration : The Account-SubmitRegistration endpoint is the endpoint that gets hit when a shopper submits their registration for a new account
 * @name Base/Account-SubmitRegistration
 * @function
 * @memberof Account
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {querystringparameter} - rurl - redirect url. The value of this is a number. This number then gets mapped to an endpoint set up in oAuthRenentryRedirectEndpoints.js
 * @param {httpparameter} - dwfrm_profile_customer_email - Input field for the shopper's email address
 * @param {httpparameter} - dwfrm_profile_login_password - Input field for the shopper's password
 * @param {httpparameter} - csrf_token - hidden input field CSRF token
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.replace(
    'SubmitRegistration',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        const CustomerMgr = require('dw/customer/CustomerMgr');
        const Resource = require('dw/web/Resource');

        const formErrors = require('*/cartridge/scripts/formErrors');

        const registrationForm = server.forms.getForm('profile');

        if (!CustomerMgr.isAcceptablePassword(registrationForm.login.password.value)) {
            registrationForm.login.password.valid = false;
            registrationForm.valid = false;
        }

        const registrationFormObj = {
            email: registrationForm.customer.email.value,
            password: registrationForm.login.password.value,
            validForm: registrationForm.valid,
            form: registrationForm
        };

        if (registrationForm.valid) {
            res.setViewData(registrationFormObj);

            this.on('route:BeforeComplete', function (req, res) {
                const Transaction = require('dw/system/Transaction');
                const accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');
                let authenticatedCustomer;
                let serverError;

                const registrationForm = res.getViewData();

                if (registrationForm.validForm) {
                    const login = registrationForm.email;
                    const password = registrationForm.password;

                    try {
                        Transaction.wrap(function () {
                            const error = {};
                            const newCustomer = CustomerMgr.createCustomer(login, password);

                            const authenticateCustomerResult = CustomerMgr.authenticateCustomer(
                                login,
                                password
                            );
                            if (authenticateCustomerResult.status !== 'AUTH_OK') {
                                error = {
                                    authError: true,
                                    status: authenticateCustomerResult.status
                                };
                                throw error;
                            }

                            authenticatedCustomer = CustomerMgr.loginCustomer(
                                authenticateCustomerResult,
                                false
                            );

                            if (!authenticatedCustomer) {
                                error = {
                                    authError: true,
                                    status: authenticateCustomerResult.status
                                };
                                throw error;

                            } else {
                                const newCustomerProfile = newCustomer.getProfile();
                                newCustomerProfile.email = registrationForm.email;
                            }
                        });
                    } catch (e) {
                        if (e.authError) {
                            serverError = true;
                        } else {
                            registrationForm.validForm = false;
                            registrationForm.form.customer.email.valid = false;
                            registrationForm.form.customer.email.error = Resource.msg(
                                'error.message.username.invalid',
                                'forms',
                                null
                            );
                        }
                    }
                }

                delete registrationForm.password;
                formErrors.removeFormValues(registrationForm.form);

                if (serverError) {
                    res.setStatusCode(500);
                    res.json({
                        success: false,
                        errorMessage: Resource.msg(
                            'error.message.unable.to.create.account',
                            'login',
                            null
                        )
                    });

                    return;
                }

                if (registrationForm.validForm) {
                    accountHelpers.sendCreateAccountEmail(authenticatedCustomer.profile);

                    res.setViewData({ authenticatedCustomer: authenticatedCustomer });
                    res.json({
                        success: true,
                        redirectUrl: accountHelpers.getLoginRedirectURL(
                            req.querystring.rurl,
                            req.session.privacyCache,
                            true
                        )
                    });

                    req.session.privacyCache.set('args', null);
                } else {
                    res.json({
                        fields: formErrors.getFormErrors(registrationForm)
                    });
                }
            });

        } else {
            res.json({
                fields: formErrors.getFormErrors(registrationForm)
            });
        }
        return next();
    }
);

module.exports = server.exports();
