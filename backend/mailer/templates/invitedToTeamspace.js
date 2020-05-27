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
const { ctaButton,  basicEmailTemplate, SIGN_OFF } = require("./basicEmailTemplate");

const html = ({name, company, teamspace, url}) => basicEmailTemplate(`
		${name} <em>(${company})</em> invites you to join their teamspace <strong>${teamspace}</strong>. Please press on the button below to sign up and start collaborating.
		${(ctaButton(`Join ${teamspace}`, url))}
		${SIGN_OFF}
		<br />
`);

const subject = data => `${data.name} has invited you to collaborate in 3D Repo`;

module.exports =  {
	html,
	subject
};
