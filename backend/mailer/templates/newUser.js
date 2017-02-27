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
	We have one more new user signed up on ${data.url}!
	<br><br>
	Email: ${data.email}
	<br>
	Name: ${data.firstName} ${data.lastName}
	<br>
	Company: ${data.company} 
	<br>
	Job title: ${data.jobTitle} 
	<br>
	Country: ${data.country}
	<br>
	Phone: ${data.phoneNo}
`;

var subject = data => `[New User][${data.company}] New user from ${data.company} signed up`;

module.exports =  {
	html: html,
	subject: subject
};
