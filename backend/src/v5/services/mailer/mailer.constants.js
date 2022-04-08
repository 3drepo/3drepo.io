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

const verifyUser = require('./templates/verifyUser');
const forgotPassword = require('./templates/forgotPassword');
const fileMissing = require('./templates/fileMissing');
const MailerConstants = {};

MailerConstants.templates = {
    VERIFY_USER: { html: (data) => verifyUser.html(data), subject: () => verifyUser.subject },
    FORGOT_PASSWORD: { html: (data) => forgotPassword.html(data), subject: () => forgotPassword.subject },
    FILE_MISSING: { html: (data) => fileMissing.html(data), subject: (data) => fileMissing.subject(data) },
}

for (const templateName in MailerConstants.templates) {    
    MailerConstants.templates[templateName].name = templateName;
}

module.exports = MailerConstants;
