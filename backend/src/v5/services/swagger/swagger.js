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
const { v4Path } = require('../../../interop');
// FIXME: can remove the disable once we migrated config
// eslint-disable-next-line
const { apiUrls } = require(`${v4Path}/config`);
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
			{ url: `${apiUrls.all[0]}/v5` },
		],
		security: [
			{ keyAuth: [] },
		],
		basePath: '/api/v5',
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
	app.use('/docs', swaggerUi.serve, swaggerUi.setup(docs, uiOptions));
};

module.exports = setupDocEndpoint;
