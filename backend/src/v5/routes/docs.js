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

const { getSwaggerComponents } = require('../utils/responseCodes');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: '3D Repo IO',
			version: '5.0.0',
		},
		servers: [
			{ url: 'http://api1.example.org/api/v5' },
		],
		security: [
			{ keyAuth: [] },
		],
	},
	apis: [`${__dirname}/**/*.js`], // files containing annotations as above
};

const setupDocEndpoint = (app) => {
	const docs = swaggerJsdoc(options);
	docs.basePath = '/api/v5';
	docs.components = docs.components || {};
	const { schemas, responses } = getSwaggerComponents();
	docs.components.schemas = { ...(docs.components.schemas || {}), ...schemas };
	docs.components.responses = { ...(docs.components.responses || {}), ...responses };

	// Setup API key security bearer
	docs.components.securitySchemes = {
		keyAuth: {
			type: 'apiKey',
			in: 'query',
			name: 'key',
		},
	};
	const uiOptions = {
		explorer: true,
	};

	console.log(JSON.stringify(docs));
	app.use('/docs', swaggerUi.serve, swaggerUi.setup(docs, uiOptions));
};

module.exports = setupDocEndpoint;
