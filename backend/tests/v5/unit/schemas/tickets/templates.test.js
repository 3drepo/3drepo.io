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

const { determineTestGroup } = require('../../../helper/utils');
const { cloneDeep, times } = require('lodash');
const { src } = require('../../../helper/path');
const { generateRandomString, generateCustomStatusValues } = require('../../../helper/services');
const { supportedPatterns } = require('../../../../../src/v5/schemas/tickets/templates.constants');

const { statusTypes, statuses, getDefaultPinIconNames } = require(`${src}/schemas/tickets/templates.constants`);

const TemplateSchema = require(`${src}/schemas/tickets/templates`);
const { propTypes, getApplicableDefaultProperties, presetModules, presetEnumValues, presetModulesProperties, basePropertyLabels } = require(`${src}/schemas/tickets/templates.constants`);

const testValidate = () => {
	const statusValues = generateCustomStatusValues();

	const generateBasicSchema = ({ modules, properties, config, deprecated }) => ({
		name: generateRandomString(),
		code: generateRandomString(3),
		modules,
		properties,
		config,
		deprecated,
	});

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
		['all optional properties provided',
			generateBasicSchema({
				config: {
					comments: false,
					issueProperties: true,
					defaultView: true,
					defaultImage: false,
					pin: true,
				},
				deprecated: true,
			}),
			true],
		['pin with a colour defined',
			generateBasicSchema({
				config: {
					pin: { color: [50, 50, 50] },
				},
			}),
			true],
		['pin with a colour and icon defined',
			generateBasicSchema({
				config: {
					pin: {
						color: [50, 50, 50],
						icon: {
							property: {
								name: 'fixedName',
							},
							mapping: [{
								default: 'RISK',
							}],
						},
					},
				},
				properties: [{
					name: 'fixedName',
					type: propTypes.TEXT,
				}],
			}),
			true],
		['pin with an icon mapping with an invalid default icon',
			generateBasicSchema({
				config: {
					pin: {
						color: [50, 50, 50],
						icon: {
							property: {
								name: 'fixedName',
							},
							mapping: [{
								default: generateRandomString(),
							}],
						},
					},

				},
				properties: [{
					name: 'fixedName',
					type: propTypes.TEXT,
				}],
			}), false],
		['pin with a legacy scalar icon',
			generateBasicSchema({
				config: {
					pin: {
						icon: 'RISK',
					},
				},
			}), true],
		['pin with an icon mapping with no mapping entries',
			generateBasicSchema({
				config: {
					pin: {
						icon: {
							property: { name: 'fixedName' },
						},
					},
				},
				properties: [{ name: 'fixedName', type: propTypes.TEXT }],
			}), false],
		['pin with a colour logic defined',
			generateBasicSchema({
				config: {
					pin: {
						color: {
							property: {
								name: 'fixedName',
							},
							mapping: [
								{
									default: [255, 255, 255],
								},
								{
									value: generateRandomString(),
									color: [50, 50, 50],
								},
								{
									value: generateRandomString(),
									color: [0, 0, 50],
								},
							],
						},
					},

				},
				properties: [{
					name: 'fixedName',
					type: propTypes.TEXT,
				}],
			}), true],
		['pin with a colour logic and icon defined ',
			generateBasicSchema({
				config: {
					pin: {
						color: {
							property: {
								name: 'fixedName',
							},
							mapping: [
								{
									default: [255, 255, 255],
								},
								{
									value: generateRandomString(),
									color: [50, 50, 50],
								},
								{
									value: generateRandomString(),
									color: [0, 0, 50],
								},
							],
						},
						icon: {
							property: {
								name: 'fixedName',
							},
							mapping: [
								{
									default: 'ISSUE',
								},
								{
									value: generateRandomString(),
									icon: 'RISK',
								},
							],
						},
					},

				},
				properties: [{
					name: 'fixedName',
					type: propTypes.TEXT,
				}],
			}), true],
		['pin with an icon mapping that has an invalid conditional icon', generateBasicSchema({
			config: {
				pin: {
					color: {
						property: {
							name: 'fixedName',
						},
						mapping: [
							{
								default: [255, 255, 255],
							},
							{
								value: generateRandomString(),
								color: [50, 50, 50],
							},
							{
								value: generateRandomString(),
								color: [0, 0, 50],
							},
						],
					},
					icon: {
						property: {
							name: 'fixedName',
						},
						mapping: [
							{
								default: 'ISSUE',
							},
							{
								value: generateRandomString(),
								icon: generateRandomString(),
							},
						],
					},
				},

			},
			properties: [{
				name: 'fixedName',
				type: propTypes.TEXT,
			}],
		}), false],
		['pin with an icon mapping that has no default entry', generateBasicSchema({
			config: {
				pin: {
					icon: {
						property: { name: 'fixedName' },
						mapping: [{ value: generateRandomString(), icon: 'RISK' }],
					},
				},
			},
			properties: [{ name: 'fixedName', type: propTypes.TEXT }],
		}), false],
		['pin with an icon mapping that has multiple default entries', generateBasicSchema({
			config: {
				pin: {
					icon: {
						property: { name: 'fixedName' },
						mapping: [{ default: 'RISK' }, { default: 'ISSUE' }],
					},
				},
			},
			properties: [{ name: 'fixedName', type: propTypes.TEXT }],
		}), false],
		['pin with an icon mapping whose conditional entry has no value', generateBasicSchema({
			config: {
				pin: {
					icon: {
						property: { name: 'fixedName' },
						mapping: [{ default: 'RISK' }, { icon: 'ISSUE' }],
					},
				},
			},
			properties: [{ name: 'fixedName', type: propTypes.TEXT }],
		}), false],
		['pin with an icon mapping whose conditional entry has no icon', generateBasicSchema({
			config: {
				pin: {
					icon: {
						property: { name: 'fixedName' },
						mapping: [{ default: 'RISK' }, { value: generateRandomString() }],
					},
				},
			},
			properties: [{ name: 'fixedName', type: propTypes.TEXT }],
		}), false],
		['pin with an icon mapping that has no property name', generateBasicSchema({
			config: {
				pin: {
					icon: {
						property: {},
						mapping: [{ default: 'RISK' }],
					},
				},
			},
		}), false],
		['pin with an icon mapping that references a module property', generateBasicSchema({
			config: {
				pin: {
					icon: {
						property: { name: 'fixedName', module: 'mod' },
						mapping: [{ default: 'MARKER' }],
					},
				},
			},
			modules: [{
				name: 'mod',
				properties: [{ name: 'fixedName', type: propTypes.TEXT }],
			}],
		}), true],
		['pin with a colour logic defined but no default specified', generateBasicSchema({
			config: {
				pin: {
					color: {
						property: {
							name: generateRandomString(),
						},
						mapping: [
							{
								value: generateRandomString(),
								color: [50, 50, 50],
							},
							{
								value: generateRandomString(),
								color: [0, 0, 50],
							},
						],
					},
				},

			},
		}), false],
		['pin with a colour logic defined but more than 1 default specified', generateBasicSchema({
			config: {
				pin: {
					color: {
						property: {
							name: generateRandomString(),
						},
						mapping: [
							{
								default: [50, 50, 50],
							},
							{
								default: [0, 0, 50],
							},
						],
					},
				},

			},
		}), false],
		['pin with a colour logic defined (module property)', generateBasicSchema({
			config: {
				pin: {
					color: {
						property: {
							name: 'name',
							module: 'mod',
						},
						mapping: [
							{
								default: [255, 255, 255],
							},
							{
								value: generateRandomString(),
								color: [50, 50, 50],
							},
							{
								value: generateRandomString(),
								color: [0, 0, 50],
							},
						],
					},
				},

			},
			properties: undefined,
			modules: [
				{
					name: 'mod',
					properties: [
						{
							name: 'name',
							type: propTypes.TEXT,
						},
					],
				},
			],
		}), true],

		['pin with an invalid colour', generateBasicSchema({
			config: {
				pin: { color: generateRandomString() },

			},
		}), false],
		['pin defined with empty object', generateBasicSchema({
			config: {
				pin: {},

			},
		}), false],
		['status with no values', generateBasicSchema({
			config: {
				status: { default: generateRandomString() },

			},
		}), false],
		['status with empty values array', generateBasicSchema({
			config: {
				status: { values: [], default: generateRandomString() },

			},
		}), false],
		['status with no default', generateBasicSchema({
			config: {
				status: { values: statusValues },

			},
		}), false],
		['status that has a value with no name', generateBasicSchema({
			config: {
				status: {
					values: [...statusValues, { type: statusTypes.OPEN }],
					default: statusValues[0].name,
				},

			},
		}), false],
		['status that has a value with no type', generateBasicSchema({
			config: {
				status: {
					values: [...statusValues, { name: generateRandomString() }],
					default: statusValues[0].name,
				},

			},
		}), false],
		['status that has a value with invalid type', generateBasicSchema({
			config: {
				status: {
					values: [...statusValues, { name: generateRandomString(), type: generateRandomString() }],
					default: statusValues[0].name,
				},

			},
		}), false],
		['status that has a default which does not exist in values', generateBasicSchema({
			config: {
				status: {
					values: statusValues,
					default: generateRandomString(15),
				},

			},
		}), false],
		['status with duplicated values', generateBasicSchema({
			config: {
				status: {
					values: [...statusValues, ...statusValues],
					default: statusValues[0].name,
				},

			},
		}), false],
		['status with no open type', generateBasicSchema({
			config: {
				status: {
					values: statusValues.filter(({ type }) => type !== statusTypes.OPEN),
					default: statusValues.find(({ type }) => type !== statusTypes.OPEN).name,
				},

			},
		}), false],
		['status with no done type', generateBasicSchema({
			config: {
				status: {
					values: statusValues.filter(({ type }) => type !== statusTypes.DONE),
					default: statusValues.find(({ type }) => type !== statusTypes.DONE).name,
				},

			},
		}), false],
		['status with only open and void', generateBasicSchema({
			config: {
				status: {
					values: statusValues.filter(({ type }) => [statusTypes.OPEN, statusTypes.VOID].includes(type)),
					default: statusValues.find(({ type }) => type === statusTypes.OPEN).name,
				},

			},
		}), false],
		['status that is valid', generateBasicSchema({
			config: {
				status: {
					values: statusValues,
					default: statusValues[0].name,
				},

			},
		}), true],
		['status with open and done types is valid', generateBasicSchema({
			config: {
				status: {
					values: statusValues.filter(
						({ type }) => [statusTypes.OPEN, statusTypes.DONE, statusTypes.VOID].includes(type),
					),
					default: statusValues.find(({ type }) => type === statusTypes.OPEN).name,
				},

			},
		}), true],
		['properties is an empty array', generateBasicSchema({ properties: [] }), true],
		['properties is of the wrong type', generateBasicSchema({ properties: 'a' }), false],
		['property name is used by a default property', generateBasicSchema({
			properties: [{
				name: basePropertyLabels.STATUS,
				type: propTypes.TEXT,
			}],
		}), false],
		['modules is an empty array', generateBasicSchema({ modules: [] }), true],
		['modules is of the wrong type', generateBasicSchema({ modules: 'a' }), false],
	];

	const propertiesTest = [
		['property is undefined', generateBasicSchema({ properties: [undefined] }), false],
		['property is not an object', generateBasicSchema({ properties: ['a'] }), false],
		['property is an empty object', generateBasicSchema({ properties: [{}] }), false],
		['property has an unknown type', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: 'abc',
			}],

		}), false],
		['property has all required properties', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.TEXT,
			}],

		}), true],
		['tags property has all required properties', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.TAGS,
			}],

		}), true],
		['property is unique', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.TEXT,
				unique: true,
			}],

		}), true],
		['number property is unique', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.NUMBER,
				unique: true,
			}],

		}), true],
		['date property is unique', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.DATE,
				unique: true,
			}],

		}), true],
		['pastDate property is unique', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.PAST_DATE,
				unique: true,
			}],

		}), true],
		['oneOf property is unique', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.ONE_OF,
				values: [generateRandomString(), generateRandomString()],
				unique: true,
			}],

		}), true],
		['property is unique for unsupported type', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.BOOLEAN,
				unique: true,

			}],
		}), false],
		['property is unique for manyOf type', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.MANY_OF,
				values: [generateRandomString(), generateRandomString()],
				unique: true,

			}],
		}), false],
		['property is unique for tags type', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.TAGS,
				unique: true,

			}],
		}), false],
		['property is readOnly', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.BOOLEAN,
				readOnly: true,
			}],
		}), true],
		['property is readOnly and required', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.BOOLEAN,
				readOnly: true,
				required: true,
			}],
		}), false],
		['property is not readOnly but value is configured', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.TEXT,
				value: generateRandomString(),
			}],
		}), false],
		['property is readOnly but value contains no placeholder', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.TEXT,
				readOnly: true,
				value: generateRandomString(),
			}],
		}), true],
		['property is readOnly but type is not supported', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.DATE,
				readOnly: true,
				value: generateRandomString(),
			}],
		}), false],
		['property is readOnly but value contains unknown placeholder', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.TEXT,
				readOnly: true,
				value: `{${generateRandomString()}}`,
			}],
		}), false],
		['property is readOnly but value contains known placeholders', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.TEXT,
				readOnly: true,
				value: Object.values(supportedPatterns).map((p) => `{${p}}${generateRandomString()}`).join(' '),
			}],
		}), true],
		['property is readOnly but value contains known placeholders (long text)', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.LONG_TEXT,
				readOnly: true,
				value: Object.values(supportedPatterns).map((p) => `{${p}}${generateRandomString()}`).join(' '),
			}],
		}), true],
		['property is readOnlyOnUI', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.TEXT,
				readOnlyOnUI: true,
			}],

		}), true],
		['property is hiddenOnUI', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.TEXT,
				hiddenOnUI: true,
			}],

		}), true],
		['property is immutable', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.TEXT,
				immutable: true,
			}],

		}), true],
		['property name contains fullstop', generateBasicSchema({
			properties: [{
				name: `${generateRandomString()}.`,
				type: propTypes.TEXT,
			}],

		}), false],
		['property name starts with dollar sign', generateBasicSchema({
			properties: [{
				name: `$${generateRandomString()}`,
				type: propTypes.TEXT,
			}],

		}), false],
		['property name contains colon', generateBasicSchema({
			properties: [{
				name: `${generateRandomString()}:`,
				type: propTypes.TEXT,
			}],

		}), false],
		['property name contains double quotes', generateBasicSchema({
			properties: [{
				name: `${generateRandomString()}"`,
				type: propTypes.TEXT,
			}],

		}), false],
		['property name contains square brackets', generateBasicSchema({
			properties: [{
				name: `${generateRandomString()}[]`,
				type: propTypes.TEXT,
			}],

		}), false],
		['property with enum type without values', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.ONE_OF,
			}],

		}), false],
		['property with enum type with duplicated values', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.ONE_OF,
				values: [generateRandomString(), generateRandomString(), 'a', 'a'],
			}],

		}), false],
		['property with enum type with duplicated values', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.MANY_OF,
				values: [generateRandomString(), generateRandomString(), 'a', 'a'],
			}],

		}), false],
		['property with enum type with values', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.ONE_OF,
				values: [generateRandomString(), generateRandomString()],
			}],

		}), true],
		['property with enum type with values where default value is not within the values provided', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.ONE_OF,
				values: [generateRandomString(), generateRandomString()],
				default: generateRandomString(),
			}],

		}), true],
		['property with enum type with values where default values are valid', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.MANY_OF,
				values: ['a', 'b'],
				default: ['a', 'b'],
			}],

		}), true],
		['tags property with default values', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.TAGS,
				default: ['a', 'b'],
			}],

		}), true],
		['tags property with values configured strips values', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.TAGS,
				values: ['a', 'b'],
			}],

		}), true],
		['tags property with duplicated default values', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.TAGS,
				default: ['a', 'a'],
			}],

		}), true],
		['tags property with empty default values', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.TAGS,
				default: [],
			}],

		}), false],
		['tags property with too long default value', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.TAGS,
				default: [generateRandomString(121)],
			}],

		}), false],
		['property with enum type with values being the wrong type', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.MANY_OF,
				values: [123, 12354],
			}],

		}), false],

		['property with enum type with values being the a preset list', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.MANY_OF,
				values: presetEnumValues.JOBS_AND_USERS,
			}],

		}), true],
		['property with enum type with values is the wrong type', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.ONE_OF,
				values: [generateRandomString(), generateRandomString(), 'a'],
				default: ['a'],
			}],

		}), false],
		['property with enum type with values where default values are duplicated', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.MANY_OF,
				values: [generateRandomString(), generateRandomString(), 'a'],
				default: ['a', 'a'],
			}],

		}), true],
		['property name is too long', generateBasicSchema({
			properties: [{
				name: generateRandomString(121),
				type: propTypes.TEXT,
			}],

		}), false],
		['all properties has all required properties', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.TEXT,
			}, {
				name: generateRandomString(),
				type: propTypes.NUMBER,
				default: 10,
			}],

		}), true],
		['one of the properties doesn\'t match the schema', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.TEXT,
			}, {
				name: generateRandomString(),
				type: propTypes.NUMBER,
				default: generateRandomString(),
			}],

		}), false],
		['more than one property has the same name', generateBasicSchema({
			properties: [{
				name: 'A',
				type: propTypes.TEXT,
			}, {
				name: 'A',
				type: propTypes.NUMBER,
			}],

		}), false],

		['more than one property has the same name but different case', generateBasicSchema({
			properties: [{
				name: 'A',
				type: propTypes.TEXT,
			}, {
				name: 'a',
				type: propTypes.NUMBER,
			}],

		}), true],
		['property default value type matches', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.TEXT,
				default: generateRandomString(),
			}],

		}), true],
		['property default value type mismatches', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.NUMBER,
				default: generateRandomString(),
			}],

		}), false],
		['Coord property with no colour', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.COORDS,
			}],

		}), true],
		['Coord property with color defined', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.COORDS,
				color: [50, 50, 50],
			}],

		}), true],
		['Coord property with an invalid color defined', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.COORDS,
				color: ['a', 'b', 'c'],
			}],

		}), false],
		['Coord property with an icon defined', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.COORDS,
				icon: 'RISK',
			}],

		}), true],
		['Coord property with an invalid icon defined', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.COORDS,
				icon: generateRandomString(),
			}],

		}), false],
		['Coord property with icon mapping defined', generateBasicSchema({
			properties: [
				{
					name: 'refMap',
					type: propTypes.TEXT,
				},
				{
					name: generateRandomString(),
					type: propTypes.COORDS,
					icon: {
						property: {
							name: 'refMap',
						},
						mapping: [
							{
								default: 'RISK',
							},
							{
								value: generateRandomString(),
								icon: 'ISSUE',
							},
						],
					},
				}],

		}), true],
		['Coord property with color mapping defined', generateBasicSchema({
			properties: [
				{
					name: 'refMap',
					type: propTypes.TEXT,
				},
				{
					name: generateRandomString(),
					type: propTypes.COORDS,
					color: {
						property: {
							name: 'refMap',
						},
						mapping: [
							{
								default: [100, 100, 100],
							},
							{
								value: generateRandomString(),
								color: [50, 50, 50],
							},
							{
								value: generateRandomString(),
								color: [0, 0, 50],
							},
						],
					},
				}],

		}), true],
		['Coord property with color mapping defined but referencing a deprecated field', generateBasicSchema({
			properties: [
				{
					name: 'refMap',
					type: propTypes.TEXT,
					deprecated: true,
				},
				{
					name: generateRandomString(),
					type: propTypes.COORDS,
					color: {
						property: {
							name: 'refMap',
						},
						mapping: [
							{
								default: [100, 100, 100],
							},
							{
								value: generateRandomString(),
								color: [50, 50, 50],
							},
							{
								value: generateRandomString(),
								color: [0, 0, 50],
							},
						],
					},
				}],

		}), false],
		['Coord property with color mapping defined but referencing a non existent field', generateBasicSchema({
			properties: [
				{
					name: generateRandomString(),
					type: propTypes.TEXT,
					deprecated: true,
				},
				{
					name: generateRandomString(),
					type: propTypes.COORDS,
					color: {
						property: {
							name: generateRandomString(),
						},
						mapping: [
							{
								default: [100, 100, 100],
							},
							{
								value: generateRandomString(),
								color: [50, 50, 50],
							},
							{
								value: generateRandomString(),
								color: [0, 0, 50],
							},
						],
					},
				}],

		}), false],
		['Coord property with color mapping defined (module property)', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.COORDS,
				color: {
					property: {
						name: 'refMap',
						module: 'mod',
					},
					mapping: [
						{
							default: [100, 100, 100],
						},
						{
							value: generateRandomString(),
							color: [50, 50, 50],
						},
						{
							value: generateRandomString(),
							color: [0, 0, 50],
						},
					],
				},
			}],
			modules: [{
				name: 'mod',
				properties: [{
					name: 'refMap',
					type: propTypes.TEXT,
				}],
			}],

		}), true],
		['Coord property with color mapping defined (no default)', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.COORDS,
				color: {
					property: {
						name: generateRandomString(),
					},
					mapping: [
						{
							value: generateRandomString(),
							color: [50, 50, 50],
						},
						{
							value: generateRandomString(),
							color: [0, 0, 50],
						},
					],
				},
			}],

		}), false],
		['Coord property with color mapping defined (more than one default)', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.COORDS,
				color: {
					property: {
						name: generateRandomString(),
					},
					mapping: [
						{
							default: [1, 1, 1],
						},
						{
							default: [2, 2, 2],
						},
						{
							value: generateRandomString(),
							color: [50, 50, 50],
						},
						{
							value: generateRandomString(),
							color: [0, 0, 50],
						},
					],
				},
			}],

		}), false],
		['Coord property with no mapping', generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.COORDS,
				color: {
					property: {
						name: generateRandomString(),
					},
					mapping: [
					],
				},
			}],

		}), false],
	];

	const createSkeleton = (modules) => ({
		name: generateRandomString(), code: generateRandomString(3), modules,
	});
	const moduleSchemaTest = [
		['module with all required properties filled in (custom module)', createSkeleton([{ name: generateRandomString() }]), true],
		['module with a name that is too long', createSkeleton([{ name: generateRandomString(121) }]), false],
		['module with all required properties filled in (preset module)', createSkeleton([{ type: presetModules.SEQUENCING }]), true],
		['module with an unrecognised preset module', createSkeleton([{ type: generateRandomString() }]), false],
		['module with a name that is the same as a preset module', createSkeleton([{ name: presetModules.SEQUENCING }]), false],
		['module trying to redefine a predefined property', {
			...createSkeleton([{
				type: presetModules.SEQUENCING,

				properties: [presetModulesProperties[presetModules.SEQUENCING][0]],
			}]),
		}, false],
		['module with both name and type are defined', createSkeleton([{ name: generateRandomString(), type: presetModules.SEQUENCING }]), false],
		['module with name contains full stop', createSkeleton([{ name: `.${generateRandomString()}` }]), false],
		['module with name contains comma', createSkeleton([{ name: `,${generateRandomString()}` }]), false],
		['module with a property that has the same name as a root property', { ...createSkeleton([{ name: generateRandomString(), properties: [{ name: 'a', type: propTypes.TEXT }] }]), properties: [{ name: 'a', type: propTypes.TEXT }] }, true],
		['module with a valid color', createSkeleton([{ name: generateRandomString(), color: '#AABBCC' }]), true],
		['module with an invalid color', createSkeleton([{ name: generateRandomString(), color: generateRandomString() }]), false],
		['module with an invalid color (missing #)', createSkeleton([{ name: generateRandomString(), color: 'AABBCC' }]), false],
		['module with a valid color (preset module)', createSkeleton([{ type: presetModules.SEQUENCING, color: '#AABBCC' }]), false],
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

	const basicModules = [{
		type: presetModules.SAFETIBASE,
		properties: times(3, () => ({ name: generateRandomString(), type: propTypes.TEXT })),
	}];
	const basicProperties = times(3, () => ({ name: generateRandomString(), type: propTypes.TEXT }));
	const deprecatedModuleProperties = [{
		name: generateRandomString(),
		properties: times(3, (i) => {
			if (i === 0) return { name: generateRandomString(), type: propTypes.TEXT, deprecated: true };
			return { name: generateRandomString(), type: propTypes.TEXT };
		}),
	}];
	const deprecatedModule = [
		{
			name: generateRandomString(),
			deprecated: true,
			properties: times(3, () => ({ name: generateRandomString(), type: propTypes.TEXT })),
		},
	];
	const deprecatedProperties = times(3, (i) => {
		if (i === 0) return { name: generateRandomString(), type: propTypes.TEXT, deprecated: true };
		return { name: generateRandomString(), type: propTypes.TEXT };
	});
	const tabularColumnsTest = [
		['tabular column with all required properties filled in',
			generateBasicSchema({
				modules: basicModules,
				properties: basicProperties,
				config: {
					tabular:
					{
						columns:
							[
								{
									property: basicProperties[0].name,
								},
								{
									module: basicModules[0].type,
									property: basicModules[0].properties[0].name,
								},
							],
					},
				},
			}), true],
		['tabular column that is not in properties',
			generateBasicSchema({
				modules: basicModules,
				properties: basicProperties,
				config: {
					tabular:
					{
						columns:
							[
								{
									property: generateRandomString(),
								},
							],
					},
				},
			}), false],
		['tabular column module that is in module types',
			generateBasicSchema({
				modules: basicModules,
				properties: basicProperties,
				config: {
					tabular:
					{
						columns:
							[
								{
									property: generateRandomString(),
									module: generateRandomString(),
								},
							],
					},
				},
			}), false],
		['tabular column module property that is in module properties',
			generateBasicSchema({
				modules: basicModules,
				properties: basicProperties,
				config: {
					tabular:
					{
						columns:
							[
								{
									property: generateRandomString(),
									module: presetModules.SAFETIBASE,
								},
							],
					},
				},
			}), false],
		['tabular column property that is deprecated',
			generateBasicSchema({
				modules: basicModules,
				properties: deprecatedProperties,
				config: {
					tabular:
					{
						columns:
							[
								{
									property: deprecatedProperties[0].name,
								},
							],
					},
				},
			}), false],
		['tabular column module property that is deprecated',
			generateBasicSchema({
				modules: deprecatedModuleProperties,
				properties: basicProperties,
				config: {
					tabular:
					{
						columns:
							[
								{
									property: deprecatedModuleProperties[0].properties[0].name,
									module: deprecatedModuleProperties[0].name,
								},
							],
					},
				},
			}), false],
		['tabular column module is deprecated',
			generateBasicSchema({
				modules: deprecatedModule,
				properties: basicProperties,
				config: {
					tabular:
					{
						columns:
							[
								{
									property: deprecatedModule[0].properties[0].name,
									module: deprecatedModule[0].name,
								},
							],
					},
				},
			}), false],
	];

	const createPropertiesArray = (numberOfItems, typeOfProp) => times(numberOfItems, (i) => (i % 3 === 0 ? ({
		name: generateRandomString(),
		type: typeOfProp,
		default: true,
	}) : ({
		name: generateRandomString(),
		type: typeOfProp,
	})));

	const complexTypesDefaultTest = [
		['image property type with default true', generateBasicSchema({ properties: createPropertiesArray(5, propTypes.IMAGE) }), false],
		['view property type with default true', generateBasicSchema({ properties: createPropertiesArray(5, propTypes.VIEW) }), false],
		['image list property type with default true', generateBasicSchema({ properties: createPropertiesArray(5, propTypes.IMAGE_LIST) }), false],
		['module image property type with default true', generateBasicSchema({ modules: [{ name: generateRandomString(), properties: createPropertiesArray(5, propTypes.IMAGE) }] }), false],
		['module view property type with default true', generateBasicSchema({ modules: [{ name: generateRandomString(), properties: createPropertiesArray(5, propTypes.VIEW) }] }), false],
		['module image list property type with default true', generateBasicSchema({ modules: [{ name: generateRandomString(), properties: createPropertiesArray(5, propTypes.IMAGE_LIST) }] }), false],
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
		...tabularColumnsTest,
		...complexTypesDefaultTest,

	])('Validate ticket template', (desc, data, output) => {
		test(`Validation should ${output ? 'succeed' : 'fail'} if ${desc}`, () => {
			const testCase = expect(() => TemplateSchema.validate(data));
			if (output) testCase.not.toThrow();
			else testCase.toThrow();
		});
	});

	test('Any unknown properties should be stripped from the schema and necessary properties filled in', () => {
		const data = generateBasicSchema({
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
		});
		const expectedData = cloneDeep(data);
		expectedData.properties[2].default = new Date(expectedData.properties[2].default);
		expectedData.modules = expectedData.modules.map(({ name, ...mod }) => (
			{ ...mod, name, properties: [] }));
		expectedData.config = { defaultView: true };
		const output = TemplateSchema.validate(data);

		expect(output).toEqual(expectedData);
	});

	test('hiddenOnUI should be preserved when true and stripped when false', () => {
		const data = generateBasicSchema({
			properties: [{
				name: generateRandomString(),
				type: propTypes.TEXT,
				hiddenOnUI: true,
			}, {
				name: generateRandomString(),
				type: propTypes.TEXT,
				hiddenOnUI: false,
			}],
		});

		const output = TemplateSchema.validate(data);

		expect(output.properties[0].hiddenOnUI).toEqual(true);
		expect(output.properties[1].hiddenOnUI).toBeUndefined();
	});

	const defaultPinIconsNames = Object.keys(getDefaultPinIconNames());

	describe('Test every built-in pin icon in direct and conditional mappings', () => {
		defaultPinIconsNames.forEach((icon) => {
			test(`should accept ${icon}`, () => {
				const testIconTemplate = generateBasicSchema({
					config: {
						pin: {
							icon: {
								property: { name: 'reference' },
								mapping: [{ default: icon }],
							},
						},
					},
					properties: [
						{
							name: 'reference', type: propTypes.TEXT,
						},
						{
							name: generateRandomString(),
							type: propTypes.COORDS,
							icon,
						}],
				});

				expect(() => TemplateSchema.validate(testIconTemplate)).not.toThrow();
			});
		});
	});

	test('Icon mapping default entries strip conditional value and icon fields', () => {
		const data = generateBasicSchema({
			config: {
				pin: {
					icon: {
						property: { name: 'reference' },
						mapping: [{
							default: defaultPinIconsNames[0],
							value: generateRandomString(),
							icon: defaultPinIconsNames[1],
						}, {
							value: generateRandomString(),
							icon: defaultPinIconsNames[2],
						}],
					},
				},
			},
			properties: [{ name: 'reference', type: propTypes.TEXT }],
		});

		const output = TemplateSchema.validate(data);

		expect(output.config.pin.icon.mapping).toEqual([
			{ default: defaultPinIconsNames[0] },
			{ value: data.config.pin.icon.mapping[1].value, icon: defaultPinIconsNames[2] },
		]);
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

		test('should fill default properties when config is not defined', () => {
			const template = {
				name: generateRandomString(),
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
			expectedOutput.properties = [...getApplicableDefaultProperties({}), ...expectedOutput.properties];
			expect(output).toEqual(expectedOutput);
		});

		test('should validate created at to not be read only if import is set to true', () => {
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

			const { properties: outProps, ...output } = TemplateSchema.generateFullSchema(template, true);

			const { properties: temProps, ...expectedOutput } = cloneDeep(template);
			const expectedProps = [
				...getApplicableDefaultProperties(template.config, true),
				...temProps];

			expect(output).toEqual(expectedOutput);

			const createdAtProp = outProps.find(({ name }) => name === basePropertyLabels.CREATED_AT);
			expect(createdAtProp).toEqual(
				{
					name: basePropertyLabels.CREATED_AT,
					type: propTypes.PAST_DATE,

				});

			expect(outProps.length).toEqual(expectedProps.length);
			expect(outProps).toEqual(expect.arrayContaining(expectedProps));
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

const testGetClosedStatuses = () => {
	const config = {
		status: {
			values: [...generateCustomStatusValues(), ...generateCustomStatusValues()],
		},
	};

	const customClosedStatuses = config.status.values.flatMap(
		({ type, name }) => (type === statusTypes.DONE || type === statusTypes.VOID
			? name : []));
	const customDoneStatuses = config.status.values.flatMap(
		({ type, name }) => (type === statusTypes.DONE
			? name : []));

	describe.each([
		['when custom statuses are configured', { config }, undefined, customClosedStatuses],
		['when custom statuses are configured and void is excluded', { config }, false, customDoneStatuses],
		['when custom statuses are not configured', {}, undefined, [statuses.CLOSED, statuses.VOID]],
		['when custom statuses are not configured and void is excluded', {}, false, [statuses.CLOSED]],
	])('Get ticket closed statuses', (desc, input, includeVoid, expectedOutput) => {
		test(desc, () => {
			expect(TemplateSchema.getClosedStatuses(input, includeVoid)).toEqual(expectedOutput);
		});
	});
};

const testGetStatusDefinition = () => {
	describe('Get ticket status definition', () => {
		test('should return the default status definition when custom statuses are not configured', () => {
			const template = { config: {}, properties: [], modules: [] };

			expect(TemplateSchema.getStatusDefinition(template)).toEqual({
				values: [
					{ name: statuses.OPEN, type: statusTypes.OPEN },
					{ name: statuses.IN_PROGRESS, type: statusTypes.ACTIVE },
					{ name: statuses.FOR_APPROVAL, type: statusTypes.REVIEW },
					{ name: statuses.CLOSED, type: statusTypes.DONE },
					{ name: statuses.VOID, type: statusTypes.VOID },
				],
				default: statuses.OPEN,
			});
		});

		test('should return the custom status definition when custom statuses are configured', () => {
			const values = generateCustomStatusValues();
			const defaultStatus = values[0].name;
			const template = {
				config: {
					status: {
						values,
						default: defaultStatus,
					},
				},
				properties: [],
				modules: [],
			};

			expect(TemplateSchema.getStatusDefinition(template)).toBe(template.config.status);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testValidate();
	testGenerateFullSchema();
	testGetClosedStatuses();
	testGetStatusDefinition();
});
