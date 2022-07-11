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

const { toConstantCase } = require('../../utils/helper/strings');

const TemplateConstants = {};

TemplateConstants.fieldTypes = {};

[
	'text',
	'longText',
	'boolean',
	'date',
	'number',
	'oneOf',
	'manyOf',
].forEach((type) => {
	TemplateConstants.fieldTypes[toConstantCase(type)] = type;
});

TemplateConstants.presetModules = {};

[
	'4D',
	'Shapes',
	'Attachments',
	'Safetibase',
].forEach((mod) => {
	TemplateConstants.presetModules[toConstantCase(mod)] = mod;
});

module.exports = TemplateConstants;
