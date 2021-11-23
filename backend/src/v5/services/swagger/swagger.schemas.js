/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const { getSwaggerComponents } = require('../../utils/responseCodes');

const Schemas = { responses: getSwaggerComponents(), schemas: {} };

// Setup API key security bearer
Schemas.securitySchemes = {
	keyAuth: {
		type: 'apiKey',
		in: 'query',
		name: 'key',
	},
};

Schemas.schemas.roleDefinitions = {
	type: 'string',
	enum: ['admin', 'collaborator', 'commenter', 'viewer'],
	description: 'Possible Values:\n* `admin` - Administrator of the container/federation\n* `collaborator` - User has `commenter` right, plus the ability to upload new revisions\n* `commenter` - User has `viewer` rights, plus write access to tickets, groups and views\n* `viewer` - User has read access to the project',
};

Schemas.schemas.group = {
	description: 'Group data',
	type: 'object',
	properties: {
		_id: {
			type: 'string',
			format: 'uuid',
			description: 'Unique indentifier for the group',
		},
		color: {
			type: 'array',
			description: 'color for the group. Must be an array of 3 or 4 values between 0 to 255',
			items: {
				type: 'integer',
				minLength: 3,
				maxLength: 4,
			},
			example: [0, 0, 255],
		},
		name: {
			type: 'string',
			description: 'name of the group',
			example: 'Level 1 Facades',
		},
		description: {
			type: 'string',
			description: 'Description of the group',
			example: 'All facades on level 1',
		},
		author: {
			type: 'string',
			description: 'Author of the group',
			example: 'JaneDoe',
		},
		updatedBy: {
			type: 'string',
			description: 'The user who last updated the group',
			example: 'JohnDoe',
		},
		createdAt: {
			type: 'int64',
			description: 'Timestamp when the group was created, epoch time in ms',
			example: 1632821117000,
		},
		updatedAt: {
			type: 'int64',
			description: 'Timestamp when the group was last updated, epoch time in ms',
			example: 1632821119000,
		},
		rules: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					field: {
						type: 'string',
						description: 'The BIM data field to query',
						example: 'Floor',
					},
					operator: {
						type: 'string',
						enum: ['IS_EMPTY', 'IS_NOT_EMPTY', 'IS', 'IS_NOT', 'CONTAINS', 'NOT_CONTAINS', 'REGEX', 'EQUALS', 'NOT_EQUALS', 'GT', 'GTE', 'LT', 'LTE', 'IN_RANGE', 'NOT_IN_RANGE'],
						description: 'Operator value on this field',
						example: 'EQUALS',
					},
					value: {
						type: 'array',
						description: 'The values to use in respective of the operator. This is evaluated under the union (OR) logic',
						items: {
							type: 'number',
							example: 1,
						},

					},
				},
			},
			description: 'List of rules for the smart group. Rules are evaluated under a intersection (AND) logic',
		},
		objects: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					account: {
						type: 'string',
						example: 'Company A',
						description: 'Teamspace the objects belong in',
					},
					model: {
						type: 'string',
						format: 'uuid',
						description: 'Model ID',
					},
					shared_ids: {
						type: 'array',
						items: {
							type: 'string',
							format: 'uuid',
							description: 'shared_ids of the meshes that belong in this group',
						},
					},
					ifc_guids: {
						type: 'array',
						items: {
							type: 'string',
							description: 'IFC GUIDS that belong in this group',
							example: 'P6hfZFcXRWKz/AAALJY/Zg',
						},
					},
				},
			},
		},

	},
};

Schemas.schemas.modelSettings = {
	description: 'The settings of the model',
	type: 'object',
	properties: {
		_id: {
			type: 'string',
			format: 'uuid',
			description: 'Model ID',
			example: '3549ddf6-885d-4977-87f1-eeac43a0e818',
		},
		name: {
			type: 'string',
			description: 'The name of the model',
			example: 'Lego tree',
		},
		desc: {
			type: 'string',
			description: 'The description of the model',
			example: 'Model description',
		},
		type: {
			type: 'string',
			description: 'The type of the model',
			example: 'Structural',
		},
		surveyPoints: {
			type: 'array',
			description: 'The survey points of the model',
			items: {
				type: 'object',
				properties: {
					position: {
						type: 'array',
						description: 'The point coordinate that maps to the latLong value (should be in OpenGL axis conventions)',
						items: {
							type: 'float',
							example: '23.56',
						},
						minItems: 3,
						maxItems: 3,
					},
					latLong: {
						type: 'array',
						description: 'The latitude and longitude of the survey point',
						items: {
							type: 'float',
							example: '23.56',
						},
						minItems: 2,
						maxItems: 2,
					},
				},
			},
		},
		angleFromNorth: {
			type: 'integer',
			description: 'The angle from north of the model',
			example: 150,
		},
		timestamp: {
			type: 'integer',
			example: '1629976656315',
			description: 'The date the last model was uploaded (in ms)',
		},
		status: {
			type: 'string',
			description: 'The status of the model',
			example: 'ok',
		},
		defaultView: {
			type: 'string',
			format: 'uuid',
			description: 'The ID of the view that is being used as default view',
			example: '3549ddf6-885d-4977-87f1-eeac43a0e818',
		},
		defaultLegend: {
			type: 'string',
			format: 'uuid',
			description: 'The ID of the legend that is being used as default legend',
			example: '3549ddf6-885d-4977-87f1-eeac43a0e818',
		},
		unit: {
			type: 'string',
			description: 'The units of the model',
			example: 'mm',
			enum: ['mm', 'cm', 'dm', 'm', 'ft'],
		},
		code: {
			type: 'string',
			description: 'The code of the model',
			example: 'MOD1',
		},
		errorReason: {
			type: 'object',
			description: 'The the reason the model upload failed',
			properties: {
				message: {
					type: 'string',
					description: 'The error message',
					example: 'System error occured. Please contact support.',
				},
				timestamp: {
					type: 'integer',
					description: 'The date the error occured (in ms)',
					example: '1629976656315',
				},
				errorCode: {
					type: 'string',
					description: 'The error code',
					example: 14,
				},
			},
		},
	},
};

module.exports = Schemas;
