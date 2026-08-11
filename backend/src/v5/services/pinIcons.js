/**
 *  Copyright (C) 2026 3D Repo Ltd
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
const Path = require('path');
const fs = require('fs');

const { templates } = require('../utils/responseCodes');

const ICONS_DIR = Path.resolve(__dirname, '../../../resources/pinIcons');
const variants = ['normal', 'selected'];
const filenameRegex = /^(?<name>.+)\.(?<variant>[^.]+)\.svg$/;

const getIconDetails = () => {
	const directories = [ICONS_DIR];
	const iconFiles = {};

	for (const directory of directories) {
		fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
			if (!entry.isFile()) throw templates.pinIconNotFound;

			const match = entry.name.match(filenameRegex);
			if (!match) throw templates.pinIconNotFound;

			const { name, variant } = match.groups;
			iconFiles[name] = iconFiles[name] || {};
			iconFiles[name][variant] = Path.join(directory, entry.name);
		});
	}

	return iconFiles;
};

const PinIcons = {};

PinIcons.getIconNames = () => {
	const iconFiles = getIconDetails();
	Object.values(iconFiles).forEach((icon) => {
		const missingVariants = variants.filter((variant) => !icon[variant]);
		if (missingVariants.length) throw templates.pinIconNotFound;
	});

	return Object.keys(iconFiles).sort();
};
PinIcons.getIcon = (iconName, variant) => {
	const iconFiles = getIconDetails();
	if (!iconFiles[iconName] || !iconFiles[iconName][variant]) throw templates.pinIconNotFound;
	const iconPath = iconFiles[iconName][variant];
	return fs.readFileSync(iconPath);
};

module.exports = PinIcons;
