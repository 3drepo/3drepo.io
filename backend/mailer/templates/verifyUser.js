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

var html = data => `
	Hi there,<br>
	<br>
	Let's confirm your email address.<br>
	By clicking on the following link, you are confirming your email address ${data.email} 
	and agreeing to 3D Repo's Terms of Service.<br> 
	<br>
	<a href="${data.url}">Confirm Email Address</a>
`;

module.exports =  {
	html: html,
	subject: 'Welcome To 3D Repo! Verify Your Email‏'
};
