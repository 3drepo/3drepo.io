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

const { hasHereAccessToContainer, hasHereAccessToContainerWithCoords, hasReadAccessToContainer } = require('../../../../../middleware/permissions');
const Maps = require('../../../../../processors/teamspaces/projects/models/commons/maps');
const { Router } = require('express');
const { respond } = require('../../../../../utils/responder');
const { templates } = require('../../../../../utils/responseCodes');

const getListOfMaps = async (req, res) => {
	try {
		const { teamspace } = req.params;
		const maps = await Maps.getListOfMaps(teamspace);
		respond(req, res, templates.ok, maps);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

// deal with the error
const getHereBaseInfo = async (req, res) => {
	try {
		const info = await Maps.getHereBaseInfo();

		respond(req, res, templates.ok, info.data);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getOSMTile = async (req, res) => {
	try {
		const { zoomLevel, gridx, gridy } = req.query;
		const tile = await Maps.getOSMTile(zoomLevel, gridx, gridy);

		respond(req, res, templates.ok, Buffer.from(tile.data), { mimeType: 'image/png' });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getHereDefaultTile = async (req, res) => {
	try {
		const { zoomLevel, gridx, gridy } = req.query;
		const tile = await Maps.getHereDefaultTile(zoomLevel, gridx, gridy);

		respond(req, res, templates.ok, tile.data, { mimeType: 'image/png' });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getHereAerialTile = async (req, res) => {
	try {
		const { zoomLevel, gridx, gridy } = req.query;
		const tile = await Maps.getHereAerialTile(zoomLevel, gridx, gridy);

		respond(req, res, templates.ok, tile.data, { mimeType: 'image/png' });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getHereTrafficTile = async (req, res) => {
	try {
		const { zoomLevel, gridx, gridy } = req.query;
		const tile = await Maps.getHereTrafficTile(zoomLevel, gridx, gridy);

		respond(req, res, templates.ok, tile.data, { mimeType: 'image/png' });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getHereTrafficFlowTile = async (req, res) => {
	try {
		const { zoomLevel, gridx, gridy } = req.query;
		const tile = await Maps.getHereTrafficFlowTile(zoomLevel, gridx, gridy);

		respond(req, res, templates.ok, tile.data, { mimeType: 'image/png' });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getHereTerrainTile = async (req, res) => {
	try {
		const { zoomLevel, gridx, gridy } = req.query;
		const tile = await Maps.getHereTerrainTile(zoomLevel, gridx, gridy);

		respond(req, res, templates.ok, tile.data, { mimeType: 'image/png' });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getHereHybridTile = async (req, res) => {
	try {
		const { zoomLevel, gridx, gridy } = req.query;
		const tile = await Maps.getHereHybridTile(zoomLevel, gridx, gridy);

		respond(req, res, templates.ok, tile.data, { mimeType: 'image/png' });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getHereGreyTile = async (req, res) => {
	try {
		const { zoomLevel, gridx, gridy } = req.query;
		const tile = await Maps.getHereGreyTile(zoomLevel, gridx, gridy);

		respond(req, res, templates.ok, tile.data, { mimeType: 'image/png' });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getHereTruckRestrictionsTile = async (req, res) => {
	try {
		const { zoomLevel, gridx, gridy } = req.query;
		const tile = await Maps.getHereTruckRestrictionsTile(zoomLevel, gridx, gridy);

		respond(req, res, templates.ok, tile.data, { mimeType: 'image/png' });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getHereTruckOverlayTile = async (req, res) => {
	try {
		const { zoomLevel, gridx, gridy } = req.query;
		const tile = await Maps.getHereTruckRestrictionsOverlayTile(zoomLevel, gridx, gridy);

		respond(req, res, templates.ok, tile.data, { mimeType: 'image/png' });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getHereLabelOverlayTile = async (req, res) => {
	try {
		const { zoomLevel, gridx, gridy } = req.query;
		const tile = await Maps.getHereLabelOverlayTile(zoomLevel, gridx, gridy);

		respond(req, res, templates.ok, tile.data, { mimeType: 'image/png' });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getHereTollZoneTile = async (req, res) => {
	try {
		const { zoomLevel, gridx, gridy } = req.query;
		const tile = await Maps.getHereTollZoneTile(zoomLevel, gridx, gridy);

		respond(req, res, templates.ok, tile.data, { mimeType: 'image/png' });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getHerePOITile = async (req, res) => {
	try {
		const { zoomLevel, gridx, gridy } = req.query;
		const tile = await Maps.getHerePOITile(zoomLevel, gridx, gridy);

		respond(req, res, templates.ok, tile.data, { mimeType: 'image/png' });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/maps:
	 *   get:
	 *     description: Get the list of map providers and available layers for the container.
	 *     tags: [v:external, v:internal, Maps]
	 *     operationId: getMapsList
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: container
	 *         description: Container ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Returns the list of available maps and layers.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: array
	 *               items:
	 *                 type: object
	 *                 properties:
	 *                   name:
	 *                     type: string
	 *                     description: Map provider/display name.
	 *                   layers:
	 *                     type: array
	 *                     items:
	 *                       type: object
	 *                       properties:
	 *                         name:
	 *                           type: string
	 *                         source:
	 *                           type: string
	 */
	router.get('/', hasReadAccessToContainer, getListOfMaps);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/maps/here:
	 *   get:
	 *     description: Get HERE base map metadata used by map tile endpoints.
	 *     tags: [v:external, v:internal, Maps]
	 *     operationId: getHereBaseMapInfo
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: container
	 *         description: Container ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Returns HERE map metadata.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 */
	router.get('/here', hasHereAccessToContainer, getHereBaseInfo);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/maps/osm/tiles:
	 *   get:
	 *     description: Get an OpenStreetMap tile for the specified map coordinates.
	 *     tags: [v:external, v:internal, Maps]
	 *     operationId: getOSMMapTile
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: container
	 *         description: Container ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: zoomLevel
	 *         description: Map zoom level
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridx
	 *         description: Tile X coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridy
	 *         description: Tile Y coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *     responses:
	 *       400:
	 *         $ref: "#/components/responses/invalidArguments"
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Returns the requested map tile as PNG.
	 *         content:
	 *           image/png:
	 *             schema:
	 *               type: string
	 *               format: binary
	 */
	router.get('/osm/tiles', hasHereAccessToContainerWithCoords, getOSMTile);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/maps/here/default/tiles:
	 *   get:
	 *     description: Get a HERE default style tile for the specified map coordinates.
	 *     tags: [v:external, v:internal, Maps]
	 *     operationId: getHereDefaultMapTile
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: container
	 *         description: Container ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: zoomLevel
	 *         description: Map zoom level
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridx
	 *         description: Tile X coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridy
	 *         description: Tile Y coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *     responses:
	 *       400:
	 *         $ref: "#/components/responses/invalidArguments"
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Returns the requested map tile as PNG.
	 *         content:
	 *           image/png:
	 *             schema:
	 *               type: string
	 *               format: binary
	 */
	router.get('/here/default/tiles', hasHereAccessToContainerWithCoords, getHereDefaultTile);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/maps/here/aerial/tiles:
	 *   get:
	 *     description: Get a HERE aerial style tile for the specified map coordinates.
	 *     tags: [v:external, v:internal, Maps]
	 *     operationId: getHereAerialMapTile
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: container
	 *         description: Container ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: zoomLevel
	 *         description: Map zoom level
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridx
	 *         description: Tile X coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridy
	 *         description: Tile Y coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *     responses:
	 *       400:
	 *         $ref: "#/components/responses/invalidArguments"
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Returns the requested map tile as PNG.
	 *         content:
	 *           image/png:
	 *             schema:
	 *               type: string
	 *               format: binary
	 */
	router.get('/here/aerial/tiles', hasHereAccessToContainerWithCoords, getHereAerialTile);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/maps/here/traffic/tiles:
	 *   get:
	 *     description: Get a HERE traffic style tile for the specified map coordinates.
	 *     tags: [v:external, v:internal, Maps]
	 *     operationId: getHereTrafficMapTile
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: container
	 *         description: Container ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: zoomLevel
	 *         description: Map zoom level
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridx
	 *         description: Tile X coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridy
	 *         description: Tile Y coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *     responses:
	 *       400:
	 *         $ref: "#/components/responses/invalidArguments"
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Returns the requested map tile as PNG.
	 *         content:
	 *           image/png:
	 *             schema:
	 *               type: string
	 *               format: binary
	 */
	router.get('/here/traffic/tiles', hasHereAccessToContainerWithCoords, getHereTrafficTile);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/maps/here/trafficflow/tiles:
	 *   get:
	 *     description: Get a HERE traffic flow overlay tile for the specified map coordinates.
	 *     tags: [v:external, v:internal, Maps]
	 *     operationId: getHereTrafficFlowMapTile
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: container
	 *         description: Container ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: zoomLevel
	 *         description: Map zoom level
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridx
	 *         description: Tile X coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridy
	 *         description: Tile Y coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *     responses:
	 *       400:
	 *         $ref: "#/components/responses/invalidArguments"
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Returns the requested map tile as PNG.
	 *         content:
	 *           image/png:
	 *             schema:
	 *               type: string
	 *               format: binary
	 */
	router.get('/here/trafficflow/tiles', hasHereAccessToContainerWithCoords, getHereTrafficFlowTile);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/maps/here/terrain/tiles:
	 *   get:
	 *     description: Get a HERE terrain style tile for the specified map coordinates.
	 *     tags: [v:external, v:internal, Maps]
	 *     operationId: getHereTerrainMapTile
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: container
	 *         description: Container ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: zoomLevel
	 *         description: Map zoom level
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridx
	 *         description: Tile X coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridy
	 *         description: Tile Y coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *     responses:
	 *       400:
	 *         $ref: "#/components/responses/invalidArguments"
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Returns the requested map tile as PNG.
	 *         content:
	 *           image/png:
	 *             schema:
	 *               type: string
	 *               format: binary
	 */
	router.get('/here/terrain/tiles', hasHereAccessToContainerWithCoords, getHereTerrainTile);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/maps/here/hybrid/tiles:
	 *   get:
	 *     description: Get a HERE hybrid style tile for the specified map coordinates.
	 *     tags: [v:external, v:internal, Maps]
	 *     operationId: getHereHybridMapTile
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: container
	 *         description: Container ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: zoomLevel
	 *         description: Map zoom level
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridx
	 *         description: Tile X coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridy
	 *         description: Tile Y coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *     responses:
	 *       400:
	 *         $ref: "#/components/responses/invalidArguments"
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Returns the requested map tile as PNG.
	 *         content:
	 *           image/png:
	 *             schema:
	 *               type: string
	 *               format: binary
	 */
	router.get('/here/hybrid/tiles', hasHereAccessToContainerWithCoords, getHereHybridTile);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/maps/here/grey/tiles:
	 *   get:
	 *     description: Get a HERE grey style tile for the specified map coordinates.
	 *     tags: [v:external, v:internal, Maps]
	 *     operationId: getHereGreyMapTile
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: container
	 *         description: Container ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: zoomLevel
	 *         description: Map zoom level
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridx
	 *         description: Tile X coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridy
	 *         description: Tile Y coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *     responses:
	 *       400:
	 *         $ref: "#/components/responses/invalidArguments"
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Returns the requested map tile as PNG.
	 *         content:
	 *           image/png:
	 *             schema:
	 *               type: string
	 *               format: binary
	 */
	router.get('/here/grey/tiles', hasHereAccessToContainerWithCoords, getHereGreyTile);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/maps/here/truck/tiles:
	 *   get:
	 *     description: Get a HERE truck restrictions tile for the specified map coordinates.
	 *     tags: [v:external, v:internal, Maps]
	 *     operationId: getHereTruckRestrictionsMapTile
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: container
	 *         description: Container ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: zoomLevel
	 *         description: Map zoom level
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridx
	 *         description: Tile X coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridy
	 *         description: Tile Y coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *     responses:
	 *       400:
	 *         $ref: "#/components/responses/invalidArguments"
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Returns the requested map tile as PNG.
	 *         content:
	 *           image/png:
	 *             schema:
	 *               type: string
	 *               format: binary
	 */
	router.get('/here/truck/tiles', hasHereAccessToContainerWithCoords, getHereTruckRestrictionsTile);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/maps/here/truckoverlay/tiles:
	 *   get:
	 *     description: Get a HERE truck restrictions overlay tile for the specified map coordinates.
	 *     tags: [v:external, v:internal, Maps]
	 *     operationId: getHereTruckOverlayMapTile
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: container
	 *         description: Container ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: zoomLevel
	 *         description: Map zoom level
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridx
	 *         description: Tile X coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridy
	 *         description: Tile Y coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *     responses:
	 *       400:
	 *         $ref: "#/components/responses/invalidArguments"
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Returns the requested map tile as PNG.
	 *         content:
	 *           image/png:
	 *             schema:
	 *               type: string
	 *               format: binary
	 */
	router.get('/here/truckoverlay/tiles', hasHereAccessToContainerWithCoords, getHereTruckOverlayTile);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/maps/here/labeloverlay/tiles:
	 *   get:
	 *     description: Get a HERE label overlay tile for the specified map coordinates.
	 *     tags: [v:external, v:internal, Maps]
	 *     operationId: getHereLabelOverlayMapTile
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: container
	 *         description: Container ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: zoomLevel
	 *         description: Map zoom level
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridx
	 *         description: Tile X coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridy
	 *         description: Tile Y coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *     responses:
	 *       400:
	 *         $ref: "#/components/responses/invalidArguments"
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Returns the requested map tile as PNG.
	 *         content:
	 *           image/png:
	 *             schema:
	 *               type: string
	 *               format: binary
	 */
	router.get('/here/labeloverlay/tiles', hasHereAccessToContainerWithCoords, getHereLabelOverlayTile);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/maps/here/tollzone/tiles:
	 *   get:
	 *     description: Get a HERE toll zone style tile for the specified map coordinates.
	 *     tags: [v:external, v:internal, Maps]
	 *     operationId: getHereTollZoneMapTile
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: container
	 *         description: Container ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: zoomLevel
	 *         description: Map zoom level
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridx
	 *         description: Tile X coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridy
	 *         description: Tile Y coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *     responses:
	 *       400:
	 *         $ref: "#/components/responses/invalidArguments"
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Returns the requested map tile as PNG.
	 *         content:
	 *           image/png:
	 *             schema:
	 *               type: string
	 *               format: binary
	 */
	router.get('/here/tollzone/tiles', hasHereAccessToContainerWithCoords, getHereTollZoneTile);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/maps/here/poi/tiles:
	 *   get:
	 *     description: Get a HERE points-of-interest style tile for the specified map coordinates.
	 *     tags: [v:external, v:internal, Maps]
	 *     operationId: getHerePOIMapTile
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: container
	 *         description: Container ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: zoomLevel
	 *         description: Map zoom level
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridx
	 *         description: Tile X coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *       - name: gridy
	 *         description: Tile Y coordinate
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: number
	 *     responses:
	 *       400:
	 *         $ref: "#/components/responses/invalidArguments"
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Returns the requested map tile as PNG.
	 *         content:
	 *           image/png:
	 *             schema:
	 *               type: string
	 *               format: binary
	 */
	router.get('/here/poi/tiles', hasHereAccessToContainerWithCoords, getHerePOITile);

	return router;
};

module.exports = establishRoutes;
