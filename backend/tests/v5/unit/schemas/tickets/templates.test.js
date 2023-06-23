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

const { cloneDeep } = require('lodash');
const { src } = require('../../../helper/path');
const { generateRandomString } = require('../../../helper/services');

const TemplateSchema = require(`${src}/schemas/tickets/templates`);
const { propTypes, getApplicableDefaultProperties, presetModules, presetEnumValues, presetModulesProperties, defaultProperties } = require(`${src}/schemas/tickets/templates.constants`);

const testValidate = () => {
	const nameTests = [
		['the name is too long', { name: generateRandomString(121), code: generateRandomString(3) }, false],
		['the name is an empty string', { name: '', code: generateRandomString(3) }, false],
		['the name is not defined', { code: generateRandomString(3) }, false],
	];

	const codeTests = [
		['code is not defined', { name: generateRandomString() }, false],
		['code is too long', { name: generateRandomString(), code: generateRandomString(4) }, false],
		['code is too short', { name: generateRandomString(), code: generateRandomString(2) }, false],
	];

	const schemaFieldsTest = [
		['all optional properties provided', {
			name: generateRandomString(),
			code: generateRandomString(3),
			config: {
				comments: false,
				issueProperties: true,
				defaultView: true,
				defaultImage: false,
			},
			deprecated: true,
			properties: undefined,
			modules: undefined,
		}, true],
		['properties is an empty array', { name: generateRandomString(), code: generateRandomString(3), properties: [] }, true],
		['properties is of the wrong type', { name: generateRandomString(), code: generateRandomString(3), properties: 'a' }, false],
		['property name is used by a default property', { name: generateRandomString(), code: generateRandomString(3), properties: [defaultProperties[0]] }, false],
		['modules is an empty array', { name: generateRandomString(), code: generateRandomString(3), modules: [] }, true],
		['modules is of the wrong type', { name: generateRandomString(), code: generateRandomString(3), modules: 'a' }, false],
	];

	const propertiesTest = [
		['property is undefined', { name: generateRandomString(), code: generateRandomString(3), properties: [undefined] }, false],
		['property is not an object', { name: generateRandomString(), code: generateRandomString(3), properties: ['a'] }, false],
		['property is an empty object', { name: generateRandomString(), code: generateRandomString(3), properties: [{}] }, false],
		['property has an unknown type', { name: generateRandomString(),
			code: generateRandomString(3),
			properties: [{
				name: generateRandomString(),
				type: 'abc',
			}] }, false],
		['property has all required properties', { name: generateRandomString(),
			code: generateRandomString(3),
			properties: [{
				name: generateRandomString(),
				type: propTypes.TEXT,
			}] }, true],
		['property name contains fullstop', { name: generateRandomString(),
			code: generateRandomString(3),
			properties: [{
				name: `${generateRandomString()}.`,
				type: propTypes.TEXT,
			}] }, false],

		['property with enum type without values', { name: generateRandomString(),
			code: generateRandomString(3),
			properties: [{
				name: generateRandomString(),
				type: propTypes.ONE_OF,
			}] }, false],
		['property with enum type with values', { name: generateRandomString(),
			code: generateRandomString(3),
			properties: [{
				name: generateRandomString(),
				type: propTypes.ONE_OF,
				values: [generateRandomString(), generateRandomString()],
			}] }, true],
		['property with enum type with values where default value is not within the values provided', {
			name: generateRandomString(),
			code: generateRandomString(3),
			properties: [{
				name: generateRandomString(),
				type: propTypes.ONE_OF,
				values: [generateRandomString(), generateRandomString()],
				default: generateRandomString(),
			}] }, true],
		['property with enum type with values where default values are valid', {
			name: generateRandomString(),
			code: generateRandomString(3),
			properties: [{
				name: generateRandomString(),
				type: propTypes.MANY_OF,
				values: ['a', 'b'],
				default: ['a', 'b'],
			}] }, true],
		['property with enum type with values being the wrong type', {
			name: generateRandomString(),
			code: generateRandomString(3),
			properties: [{
				name: generateRandomString(),
				type: propTypes.MANY_OF,
				values: [123, 12354],
			}] }, false],

		['property with enum type with values being the a preset list', {
			name: generateRandomString(),
			code: generateRandomString(3),
			properties: [{
				name: generateRandomString(),
				type: propTypes.MANY_OF,
				values: presetEnumValues.JOBS_AND_USERS,
			}] }, true],
		['property with enum type with values is the wrong type', {
			name: generateRandomString(),
			code: generateRandomString(3),
			properties: [{
				name: generateRandomString(),
				type: propTypes.ONE_OF,
				values: [generateRandomString(), generateRandomString(), 'a'],
				default: ['a'],
			}] }, false],
		['property with enum type with values where default values are duplicated', {
			name: generateRandomString(),
			code: generateRandomString(3),
			properties: [{
				name: generateRandomString(),
				type: propTypes.MANY_OF,
				values: [generateRandomString(), generateRandomString(), 'a'],
				default: ['a', 'a'],
			}] }, false],
		['property name is too long', {
			name: generateRandomString(),
			code: generateRandomString(3),
			properties: [{
				name: generateRandomString(121),
				type: propTypes.TEXT,
			}] }, false],
		['all properties has all required properties', {
			name: generateRandomString(),
			code: generateRandomString(3),
			properties: [{
				name: generateRandomString(),
				type: propTypes.TEXT,
			}, {
				name: generateRandomString(),
				type: propTypes.NUMBER,
				default: 10,
			}] }, true],
		['one of the properties doesn\'t match the schema', {
			name: generateRandomString(),
			code: generateRandomString(3),
			properties: [{
				name: generateRandomString(),
				type: propTypes.TEXT,
			}, {
				name: generateRandomString(),
				type: propTypes.NUMBER,
				default: generateRandomString(),
			}] }, false],
		['more than one property has the same name', {
			name: generateRandomString(),
			code: generateRandomString(3),
			properties: [{
				name: 'A',
				type: propTypes.TEXT,
			}, {
				name: 'A',
				type: propTypes.NUMBER,
			}] }, false],

		['more than one property has the same name but different case', {
			name: generateRandomString(),
			code: generateRandomString(3),
			properties: [{
				name: 'A',
				type: propTypes.TEXT,
			}, {
				name: 'a',
				type: propTypes.NUMBER,
			}] }, true],
		['property default value type matches', {
			name: generateRandomString(),
			code: generateRandomString(3),
			properties: [{
				name: generateRandomString(),
				type: propTypes.TEXT,
				default: generateRandomString(),
			}] }, true],
		['property default value type mismatches', {
			name: generateRandomString(),
			code: generateRandomString(3),
			properties: [{
				name: generateRandomString(),
				type: propTypes.NUMBER,
				default: generateRandomString(),
			}] }, false],
	];

	const createSkeleton = (modules) => ({ name: generateRandomString(), code: generateRandomString(3), modules });
	const moduleSchemaTest = [
		['module with all required properties filled in (custom module)', createSkeleton([{ name: generateRandomString() }]), true],
		['module with a name that is too long', createSkeleton([{ name: generateRandomString(121) }]), false],
		['module with all required properties filled in (preset module)', createSkeleton([{ type: presetModules.SEQUENCING }]), true],
		['module with an unrecognised preset module', createSkeleton([{ type: generateRandomString() }]), false],
		['module with a name that is the same as a preset module', createSkeleton([{ name: presetModules.SEQUENCING }]), false],
		['module trying to redefine a predefined property', {
			...createSkeleton([{ type: presetModules.SEQUENCING,

				properties: [presetModulesProperties[presetModules.SEQUENCING][0]],
			}]),
		}, false],
		['module with both name and type are defined', createSkeleton([{ name: generateRandomString(), type: presetModules.SEQUENCING }]), false],
		['module with name contains full stop', createSkeleton([{ name: `.${generateRandomString()}` }]), false],
		['module with a property that has the same name as a root property', { ...createSkeleton([{ name: generateRandomString(), properties: [{ name: 'a', type: propTypes.TEXT }] }]), properties: [{ name: 'a', type: propTypes.TEXT }] }, true],
		['all modules provided are valid', createSkeleton([
			{ type: presetModules.SEQUENCING }, { name: generateRandomString() }]), true],
		['2 modules with same property name', createSkeleton([
			{ type: presetModules.SEQUENCING, properties: [{ name: 'a', type: propTypes.TEXT }] },
			{ name: generateRandomString(), properties: [{ name: 'a', type: propTypes.TEXT }] }]), true],
		['all modules names must be unique', createSkeleton([
			{ name: 'same' }, { name: 'same' }]), false],
		['all modules types must be unique', createSkeleton([
			{ name: 'same' }, { name: 'same' }]), false],
		['one of the modules are invalid', createSkeleton([
			{ type: generateRandomString() }, { name: generateRandomString() }]), false],
		// copy over the properties test and test it with module
		...propertiesTest.map(([desc, { properties, ...other }, output]) => [
			`module with ${desc}`,
			{ ...other, modules: [{ name: generateRandomString(), properties }, output] },
		]),
	];

	describe.each([
		['the template is undefined', undefined, false],
		['the template is empty', {}, false],
		['the template has all the required properties', { name: generateRandomString(), code: generateRandomString(3) }, true],
		...nameTests,
		...codeTests,
		...schemaFieldsTest,
		...propertiesTest,
		...moduleSchemaTest,

	])('Validate ticket template', (desc, data, output) => {
		test(`Validation should ${output ? 'succeed' : 'fail'} if ${desc}`, () => {
			const testCase = expect(() => TemplateSchema.validate(data));
			if (output) testCase.not.toThrow();
			else testCase.toThrow();
		});
	});

	test('Any unknown properties should be stripped from the schema and necessary properties filled in', () => {
		const data = {
			name: generateRandomString(),
			code: generateRandomString(3),
			config: {
				defaultView: true,
				defaultImage: true,
			},
			properties: [{
				name: 'I am an apple',
				type: propTypes.NUMBER,
			},
			{
				name: generateRandomString(),
				type: propTypes.TEXT,
				deprecated: true,
			},
			{
				name: generateRandomString(),
				type: propTypes.DATE,
				default: Date.now(),
			},
			],
			modules: [{
				name: generateRandomString(),
			}, {
				name: 'ANOTHER CASE CHECK',
			}, {
				type: presetModules.SAFETIBASE,
				deprecated: true,
			}],
		};
		const expectedData = cloneDeep(data);
		expectedData.properties[2].default = new Date(expectedData.properties[2].default);
		expectedData.modules = expectedData.modules.map(({ name, ...mod }) => (
			{ ...mod, name, properties: [] }));
		expectedData.config = { defaultView: true };
		const output = TemplateSchema.validate(data);

		expect(output).toEqual(expectedData);
	});

	test('Image field will have the default field stripped if provided', () => {
		const data = {
			name: generateRandomString(),
			code: generateRandomString(3),
			config: {
			},
			properties: [
				{
					name: generateRandomString(),
					type: propTypes.IMAGE,
					default: generateRandomString(),
				},

			],
			modules: [
				{
					type: presetModules.SAFETIBASE,
					properties: [
						{
							name: generateRandomString(),
							type: propTypes.IMAGE,
							default: generateRandomString(),
						}],
				}],
		};
		const expectedData = cloneDeep(data);
		delete expectedData.properties[0].default;
		delete expectedData.modules[0].properties[0].default;

		data[generateRandomString()] = generateRandomString();
		data.properties[0][generateRandomString()] = generateRandomString();
		data.modules[0][generateRandomString()] = generateRandomString();
		const output = TemplateSchema.validate(data);

		expect(output).toEqual(expectedData);
	});
};

const testGenerateFullSchema = () => {
	describe('Generating a full schema', () => {
		test('should fill properties with default properties', () => {
			const template = {
				name: generateRandomString(),
				config: {
					issueProperties: true,
				},
				properties: [
					{
						name: generateRandomString(),
						type: propTypes.TEXT,
					},
				],
				modules: [],
			};

			const output = TemplateSchema.generateFullSchema(template);

			const expectedOutput = cloneDeep(template);
			expectedOutput.properties = [...getApplicableDefaultProperties(template.config),
				...expectedOutput.properties];
			expect(output).toEqual(expectedOutput);
		});
		test('should fill preset modules with default properties', () => {
			const template = {
				name: generateRandomString(),
				config: {},
				properties: [
					{
						name: generateRandomString(),
						type: propTypes.TEXT,
					},
				],
				modules: [
					{
						type: presetModules.SEQUENCING,
						properties: [{
							name: generateRandomString(),
							type: propTypes.TEXT,
						}],
					},
					{
						name: generateRandomString(),
						properties: [{
							name: generateRandomString(),
							type: propTypes.TEXT,
						}],
					},
				],
			};

			const output = TemplateSchema.generateFullSchema(template);

			const expectedOutput = cloneDeep(template);
			expectedOutput.properties = [...getApplicableDefaultProperties(template.config),
				...expectedOutput.properties];
			expectedOutput.modules.forEach((module) => {
				if (module.type) {
					// eslint-disable-next-line no-param-reassign
					module.properties = [...presetModulesProperties[module.type], ...module.properties];
				}
			});

			expect(output).toEqual(expectedOutput);
		});
	});
};

describe('schema/tickets/templates', () => {
	testValidate();
	testGenerateFullSchema();
});
