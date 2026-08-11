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

const fs = require('fs');

const { determineTestGroup } = require('../../helper/utils');
const { src } = require('../../helper/path');
const { outOfOrderArrayEqual } = require('../../helper/services');

const { templates } = require(`${src}/utils/responseCodes`);

const PinIcons = require(`${src}/services/pinIcons`);

const toFsEntry = (name, isFile = true) => ({
	name,
	isFile: jest.fn().mockReturnValue(isFile),
});

const fullIconNames = ['RISK.selected.svg', 'DEFAULT.selected.svg', 'ISSUE.selected.svg', 'MARKER.selected.svg', 'RISK.normal.svg', 'DEFAULT.normal.svg', 'ISSUE.normal.svg', 'MARKER.normal.svg'];

const testBuiltInProvider = () => {
	describe('getIconNames', () => {
		test('should discover complete icon pairs in alphabetical order', () => {
			outOfOrderArrayEqual(['RISK', 'DEFAULT', 'ISSUE', 'MARKER'], PinIcons.getIconNames());
		});

		test('should throw when an icon is missing a required variant', () => {
			const returnValue = fullIconNames.filter((name) => name !== 'RISK.selected.svg').map((name) => toFsEntry(name));
			jest.spyOn(fs, 'readdirSync').mockReturnValue(returnValue);
			expect(() => PinIcons.getIconNames()).toThrow('Pin icon "RISK" is missing selected variant assets');
		});

		test('should throw for entries that are not valid icon asset files', () => {
			const returnValue = fullIconNames.map((name) => (name === 'RISK.selected.svg' ? toFsEntry('RISK.svg') : toFsEntry(name)));
			jest.spyOn(fs, 'readdirSync').mockReturnValue(returnValue);

			expect(() => PinIcons.getIconNames()).toThrow(templates.pinIconNotFound);
		});

		test('should throw for nested directories', () => {
			jest.spyOn(fs, 'readdirSync').mockReturnValue([toFsEntry('nested', false)]);

			expect(() => PinIcons.getIconNames()).toThrow(templates.pinIconNotFound);
		});
	});

	describe('getIcon', () => {
		test('should read the requested icon file', () => {
			jest.spyOn(fs, 'readdirSync').mockReturnValue(fullIconNames.map((name) => toFsEntry(name)));
			jest.spyOn(fs, 'readFileSync').mockImplementation((filePath) => Buffer.from(filePath));

			const result = PinIcons.getIcon('RISK', 'selected');
			expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('RISK.selected.svg'));
			expect(result).toBeInstanceOf(Buffer);
		});
		test('should throw when the iconName is not in the files', () => {
			jest.spyOn(fs, 'readdirSync').mockReturnValue(fullIconNames.filter((name) => name !== 'RISK.selected.svg').map((name) => toFsEntry(name)));

			expect(() => PinIcons.getIcon('RISK', 'selected')).toThrow(templates.pinIconNotFound);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	testBuiltInProvider();
});
