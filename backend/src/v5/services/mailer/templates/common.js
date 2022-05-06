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

const EJS = require('ejs');

const Common = {};

const renderTemplate = (templatePath, data) => new Promise((resolve, reject) => {
	EJS.renderFile(templatePath, data, {}, (err, output) => {
		if (err) reject(err);
		else resolve(output);
	});
});

Common.generateTemplateFn = (schema, templatePath) => async (data) => {
	const input = await schema.validate(data);
	return renderTemplate(templatePath, input);
};

module.exports = Common;
