/**
 *  Copyright (C) 2014 3D Repo Ltd
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

"use strict";

const { ctaButton,  basicEmailTemplateWithLogo } = require("./basicEmailTemplate");

// data.firstName
// data.username
// data.url

const html = ({firstName, username, url}) => basicEmailTemplateWithLogo(`
	We received a request to reset your password, for username <strong>${username}</strong>. Press on the button below to set up your new password.&nbsp;
	${ctaButton("Reset Your Password", url)}

	If you did not request a password reset, please ignore this email and contact us at&nbsp;<a href="mailto:support@3drepo.com?subject=Password%20Reset%20Support%20Query" target="_blank"><span style="color:#3452ff">support@3drepo.com</span></a>&nbsp;so we can make sure no one else is trying to access your account.
	<br /><br />
	This password reset link is only valid for 24 hours. <br />
`, firstName);

module.exports =  {
	html: html,
	subject: "Reset your password"
};
