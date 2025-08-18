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
const { fieldOperators, valueOperators } = require('../../models/metadata.rules.constants');
const { presetModules, propTypes, statusTypes } = require('../../schemas/tickets/templates.constants');
const { deleteIfUndefined } = require('../../utils/helper/objects');
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

const helpers = {
	boolDef: (description, example) => ({ type: 'boolean', ...deleteIfUndefined({ description, example }) }),
	numberDef: (description, example) => ({ type: 'number', ...deleteIfUndefined({ description, example }) }),
	stringDef: (description, example, enumVal) => ({ type: 'string', ...deleteIfUndefined({ description, example, enum: enumVal }) }),
	arrayDef: (description, items, example) => ({ type: 'array', ...deleteIfUndefined({ description, items, example }) }),
};

Schemas.schemas.roles = {
	type: 'string',
	enum: ['admin', 'collaborator', 'commenter', 'viewer'],
	description: 'Possible Values:<br/><br/>* `admin` - Administrator of the container/federation<br/><br/>* `collaborator` - User has `commenter` right, plus the ability to upload new revisions<br/><br/>* `commenter` - User has `viewer` rights, plus write access to tickets, groups and views<br/><br/>* `viewer` - User has read access to the project',
};

Schemas.schemas.errorCodes = {
	type: 'string',
	enum: [1, 2, 3, 4, 5],
	description: 'Error codes: <br/><br/>* `1` - A non SSO account with the same email already exists<br/><br/>* `2` - An SSO account witht he same email already exists<br/><br/>* `3` - The user is non SSO<br/><br/>* `4` - The user was not found<br/><br/>* `5` - Unknown',
};

const ticketTemplateStatusConfig = {
	description: 'Custom status configuration',
	type: 'object',
	required: ['values', 'default'],
	properties: {
		values: {
			type: 'array',
			items: {
				type: 'object',
				required: ['name', 'type'],
				properties: {
					name: helpers.stringDef('Name of the custom status', 'Awaiting triage'),
					type: helpers.stringDef('Status type', statusTypes.OPEN, Object.values(statusTypes)),
				},
			},
		},
		default: helpers.stringDef('Default value', 'Awaiting triage'),
	},
};

const ticketTemplatePropSchema = {
	description: 'Properties within a ticket or module',
	type: 'array',
	items: {
		type: 'object',
		required: ['name', 'type'],
		properties: {
			name: helpers.stringDef('Name of the prop', 'Floor'),
			type: helpers.stringDef('Property type', propTypes.ONE_OF, Object.values(propTypes)),
			deprecated: helpers.boolDef('Denotes if this prop is no longer in use', false),
			immutable: helpers.boolDef('Denotes if this prop is immutable', false),
			readOnlyOnUI: helpers.boolDef('Denotes if this prop can be edited from the UI', false),
			unique: helpers.boolDef('Denotes if the value of this prop should be unique among tickets of the same type in the model', false),
			required: helpers.boolDef('If this prop is required (default: false)', true),
			values: helpers.arrayDef(`list of possible values (only applicable if type is ${propTypes.ONE_OF} or ${propTypes.MANY_OF}`, helpers.stringDef(), ['Level 1', 'Level 2', 'Basement']),
		},
	},
};

const ticketTemplateModSchema = {
	description: 'Configure a custom or preset module',
	type: 'array',
	items: {
		type: 'object',
		properties: {
			name: helpers.stringDef('Name of the module', 'BCF Reference'),
			type: helpers.stringDef('Preset module name', undefined, Object.values(presetModules)),
			deprecated: helpers.boolDef('Denotes if this module is no longer in use', false),
			properties: ticketTemplatePropSchema,
		},
	},
};

const ticketTemplateConfigSchema = {
	type: 'object',
	properties: {
		comments: helpers.boolDef('Comments enabled (default: false)'),
		issueProperties: helpers.boolDef('Include issue properties (default: false)'),
		defaultView: helpers.boolDef('Include a default view with image (default: false)'),
		defaultImage: helpers.boolDef('Include a default image - this will be ignored if defaultView is set to true (default: false)'),
		pin: helpers.boolDef('Include a pin (default: false)'),
		status: ticketTemplateStatusConfig,
	},
};

Schemas.schemas.ticketTemplate = {
	description: 'Custom ticket Template',
	type: 'object',
	required: ['name'],
	properties: {
		name: helpers.stringDef('Name of the ticket', 'Risk'),
		code: { ...helpers.stringDef('A 3 character code for the template', 'RSK'), minLength: 3, maxLength: 3 },
		config: ticketTemplateConfigSchema,
		deprecated: helpers.boolDef('Denotes if this template is no longer in used', false),
		properties: ticketTemplatePropSchema,
		modules: ticketTemplateModSchema,

	},
};

Schemas.schemas.group = {
	description: 'Group data',
	type: 'object',
	properties: {
		_id: {
			type: 'string',
			format: 'uuid',
			description: 'Unique identifier for the group',
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
			type: 'number',
			description: 'Timestamp when the group was created, epoch time in ms',
			example: 1632821117000,
		},
		updatedAt: {
			type: 'number',
			description: 'Timestamp when the group was last updated, epoch time in ms',
			example: 1632821119000,
		},
		rules: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					name: {
						type: 'string',
						description: 'name of the rule',
						example: 'Rule 1',
					},
					field: {
						type: 'object',
						description: 'The BIM data field to query',
						properties: {
							operator: {
								type: 'string',
								enum: Object.keys(fieldOperators),
								description: 'Operator value on the field name',
								example: fieldOperators.IS.name,
							},
							values: {
								type: 'array',
								description: 'The values to use in respective of the operator. This is evaluated under the union (OR) logic',
								items: {
									type: 'string',
									example: 'Family Name',
								},
							},
						},
					},
					operator: {
						type: 'string',
						enum: Object.keys(valueOperators),
						description: 'Operator value on this prop',
						example: valueOperators.EQUALS.name,
					},
					values: {
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

Schemas.schemas.ticketGroup = {
	description: 'Group data',
	type: 'object',
	properties: {
		_id: {
			type: 'string',
			format: 'uuid',
			description: 'Unique identifier for the group',
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
		rules: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					name: {
						type: 'string',
						description: 'name of the rule',
						example: 'Rule 1',
					},
					field: {
						type: 'object',
						description: 'The BIM data field to query',
						properties: {
							operator: {
								type: 'string',
								enum: Object.keys(fieldOperators),
								description: 'Operator value on the field name',
								example: fieldOperators.IS.name,
							},
							values: {
								type: 'array',
								description: 'The values to use in respective of the operator. This is evaluated under the union (OR) logic',
								items: {
									type: 'string',
									example: 'Family Name',
								},
							},
						},
					},
					operator: {
						type: 'string',
						enum: Object.keys(valueOperators),
						description: 'Operator value on this prop',
						example: valueOperators.EQUALS.name,
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
					container: {
						type: 'string',
						format: 'uuid',
						description: 'Model ID',
					},
					_ids: {
						type: 'array',
						items: {
							type: 'string',
							format: 'uuid',
							description: '_ids of the meshes that belong in this group',
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
		number: {
			type: 'string',
			description: 'Unique identifier of the model (Drawings only)',
			example: 'SC1-SFT-V1-01-M3-ST-30_10_30-0001',
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
							type: 'number',
							example: '23.56',
						},
						minItems: 3,
						maxItems: 3,
					},
					latLong: {
						type: 'array',
						description: 'The latitude and longitude of the survey point',
						items: {
							type: 'number',
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

Schemas.schemas.ticketCommentView = {
	description: 'Storing spacial coordinates representing what the commenter is seeing',
	type: 'object',
	properties: {
		camera: {
			description: 'Details about the 3D camera\'s position, orientation and projection',
			type: 'object',
			properties: {
				position: {
					type: 'array',
					items: {
						type: 'number',
					},
					minItems: 3,
					maxItems: 3,
				},
				up: {
					type: 'array',
					items: {
						type: 'number',
					},
					minItems: 3,
					maxItems: 3,
				},
				forward: {
					type: 'array',
					items: {
						type: 'number',
					},
					minItems: 3,
					maxItems: 3,
				},
				type: {
					type: 'string',
					enum: ['orthographic ', 'perspective'],
				},
			},
		},
		clippingPlanes: {
			description: 'Array of planes defining which direction the model gets clipped.',
			type: 'array',
			items: {
				type: 'object',
				properties: {
					normal: {
						type: 'array',
						items: {
							type: 'number',
						},
						maxItems: 3,
					},
					distance: {
						type: 'number',
					},
					clipDirection: {
						type: 'number',
						minimum: -1,
						maximum: 1,
					},
				},
				minItems: 0,
			},
		},
		state: {
			description: 'Details about the state of the model.',
			type: 'object',
			properties: {
				showHidden: {
					type: 'boolean',
				},
				selected: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							color: {
								type: 'array',
								items: {
									type: 'number',
									minimum: 0,
									maximum: 255,
								},
								minItems: 3,
								maxItems: 3,
							},
							group: Schemas.schemas.ticketGroup,
						},
					},
				},
				colored: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							color: {
								type: 'array',
								items: {
									type: 'number',
									minimum: 0,
									maximum: 255,
								},
								minItems: 3,
								maxItems: 3,
							},
							opacity: {
								type: 'number',
								minimum: 0,
								maximum: 1,
							},
							group: Schemas.schemas.ticketGroup,
						},
					},
				},
				hidden: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							group: Schemas.schemas.ticketGroup,
						},
					},
				},
				shown: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							group: Schemas.schemas.ticketGroup,
						},
					},
				},
			},
		},
	},
};

module.exports = Schemas;
