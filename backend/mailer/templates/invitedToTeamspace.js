/**
 *  Copyright (C) 2019 3D Repo Ltd
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

const html = ({name, company, teamspace, url}) => basicEmailTemplateWithLogo(`
	<table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width:100%; min-width:100%;" width="100%" class="mcnTextContentContainer">
		<tbody><tr>
			<td valign="top" class="mcnTextContent" style="padding: 0px 0px 29px;color: #8A8A8A;font-family: Roboto, &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif;font-size: 16px;line-height: 150%;">
				${name} <em>(${company})</em> invites you to join their teamspace <strong>${teamspace}</strong>. Please press on the button below to sign up and start collaborating.
			</td>
		</tr>
		</tbody>
	</table>
	${(ctaButton(`Join ${teamspace}`, url))}
	<div style="height:30px" />
`);

const subject = data => `${data.name} has invited you to collaborate in 3D Repo`;

module.exports =  {
	html: html,
	subject: subject
};
