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
const { logger } = require('../../utils/logger');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const DEFAULT_VERSION = 'external';

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

const groupPathsByVersion = ({ paths }) => {
	const pathsByVersion = {};
	const prefix = 'v:';

	for (const [route, defs] of Object.entries(paths)) {
		for (const [verb, funcSpec] of Object.entries(defs)) {
			const { tags = [], ...rest } = funcSpec;
			const otherTags = tags.filter((tag) => !tag.startsWith(prefix));
			if (otherTags.length === tags.length) {
				throw new Error(`Route ${verb.toUpperCase()} ${route} is missing "${prefix}" tag`);
			}
			tags.forEach((element) => {
				if (element.startsWith(prefix)) {
					const version = element.split(prefix)[1].trim().toLowerCase();
					const prefixPath = version === DEFAULT_VERSION ? '/docs' : `/docs-${version}`;
					if (!pathsByVersion[prefixPath]) {
						pathsByVersion[prefixPath] = {};
					}
					if (!pathsByVersion[prefixPath][route]) {
						pathsByVersion[prefixPath][route] = {};
					}
					pathsByVersion[prefixPath][route][verb] = { tags: otherTags, ...rest };
				}
			});
		}
	}
	return pathsByVersion;
};

const setupDocEndpoint = (app) => {
	const docs = swaggerJsdoc(options);
	docs.components = docs.components || {};
	docs.components = { ...docs.components, ...Schemas };
	const uiOptions = {
		explorer: true,
	};
	const pathsByGroups = groupPathsByVersion(docs);

	const generateDocWithVersion = (route, filteredDoc) => {
		logger.logInfo(`Setting up Swagger doc endpoint at ${route}`);
		app.use(`${route}/openapi.json`, (req, res) => res.json(filteredDoc));
		app.use(
			route,
			swaggerUi.serve,
			swaggerUi.setup(filteredDoc, uiOptions),
		);
	};

	app.use('/docs-list', (req, res) => res.json({ uri: Object.keys(pathsByGroups) }));
	for (const [version, paths] of Object.entries(pathsByGroups)) {
		generateDocWithVersion(version, { ...docs, paths });
	}
};

module.exports = setupDocEndpoint;
