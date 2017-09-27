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
	Your model ${data.model} has been processed successfully without errors and is now ready.<br><br>
	<a href="${data.url}">Go to my model</a>
	<br><br>
	Best,<br>
	3D Repo
`;

var subject = data => `Your model ${data.model} is now ready`;

module.exports =  {
	html: html,
	subject: subject
};
