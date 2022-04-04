/**
 *  Copyright (C) 2022 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// const { v4Path } = require('../../interop');
// // eslint-disable-next-line import/no-dynamic-require, security/detect-non-literal-require, require-sort/require-sort
// const Mailer = require(`${v4Path}/mailer/mailer`);

// module.exports = Mailer;


const { createTestAccount } = require("nodemailer");
const nodemailer = require("nodemailer");
const config = require("../../utils/config");
const getBaseURL = config.getBaseURL;
const { logger } = require("../../utils/logger");
let transporter;

const Mailer = {};

Mailer.sendEmail = async (templateName, to, data, attachments) => {
    if (!config?.mail?.sender) {
        throw { message: "config.mail.sender is not set" };
    }

    if (!config?.mail?.smtpConfig) {
        if (config?.mail?.generateCredentials) {
            const { user, pass } = await createTestAccount();
            config.mail.smtpConfig = {
                host: "smtp.ethereal.email",
                port: 587,
                auth: { user, pass }
            };
        } else {
            throw { message: "config.mail.smtpConfig is not set" };
        }
    }

    const template = require(`./templates/${templateName}`);

    const mailOptions = {
        from: config.mail.sender,
        to,
        subject: typeof template.subject === "function" ? template.subject(data) : template.subject,
        html: template.html(data)
    };

    if (attachments) {
        mailOptions.attachments = attachments;
    }

    transporter = transporter || nodemailer.createTransport(config.mail.smtpConfig);

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                logger.logDebug(`Email error - ${err.message}`);
                reject(err);
            } else {
                resolve(info);
            }
        });
    });
}

Mailer.getURL = (urlName, params) => {
    if (!C.MAIL_URLS || !C.MAIL_URLS[urlName]) {
        return Promise.reject({ message: `config.mails.urls[${urlName}] is not defined` });
    }

    return getBaseURL() + C.MAIL_URLS[urlName](params);
}

function sendVerifyUserEmail(to, data) {

    data.url = getURL("verify", { token: data.token, username: data.username, pay: data.pay });

    if (!data.url) {
        return rejectNoUrl("verify");
    }

    const template = require("./templates/verifyUser");
    return sendEmail(template, to, data);
}

function sendResetPasswordEmail(to, data) {
    data.url = getURL("forgotPassword", { token: data.token, username: data.username });

    if (!data.url) {
        return rejectNoUrl("forgotPassword");
    }
    const template = require("./templates/forgotPassword");
    return sendEmail(template, to, data);
}

module.exports = Mailer;
