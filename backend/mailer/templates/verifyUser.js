/**
 *
 *  Copyright (C) 2020 3D Repo Ltd
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

const { ctaButton,  basicEmailTemplate, SIGN_OFF } = require("./basicEmailTemplate");

const html = ({url, firstName}) => basicEmailTemplate(`
Thank you for signing up to 3D Repo.<br />
Please press on the button below to verify your email address.
${ctaButton("Verify Email Addres", url)}
<div valign="top" class="mcnTextContent" style="padding: 27px 0px 9px;color: #8A8A8A;font-family: Roboto, &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif;font-size: 14px;line-height: 150%;text-align: center;">
    Alternatively, Copy and Paste the link below into your browser:<br>
	<span style="color:#3452ff">${url}</span>
</div>
<br />
By verifying your email address you are agreeing to 3D Repo's <a href="https://www.3drepo.io/terms" target="_blank"><span style="color:#3452ff;  word-break: break-all;">Terms of Service</span></a>
 ${SIGN_OFF}
<br />
`, firstName);

module.exports =  {
	html: html,
	subject: "Welcome to 3D Repo! Verify Your Email‏"
};
