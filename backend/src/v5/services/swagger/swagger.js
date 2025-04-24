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
const Schemas = require('./swagger.schemas');

const { VERSION } = require('../../../../VERSION.json');
const { createEndpointURL } = require('../../utils/config');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: '3D Repo IO',
			version: VERSION,
		},
		servers: [
			{ url: createEndpointURL() },
		],
		security: [
			{ keyAuth: [] },
		],
	},
	apis: [`${__dirname}/../../routes/**/*.js`], // files containing annotations as above
};

const setupDocEndpoint = (app) => {
	const docs = swaggerJsdoc(options);
	docs.components = docs.components || {};
	docs.components = { ...docs.components, ...Schemas };
	const uiOptions = {
		explorer: true,
	};

	app.use('/docs/openapi.json', (req, res) => res.json(docs));
	app.use('/docs', swaggerUi.serve, swaggerUi.setup(docs, uiOptions));
};

module.exports = setupDocEndpoint;
