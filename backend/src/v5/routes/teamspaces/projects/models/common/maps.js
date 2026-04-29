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

	/** */
	router.get('/', hasReadAccessToContainer, getListOfMaps);

	/** */
	router.get('/here', hasHereAccessToContainer, getHereBaseInfo);

	/** */
	router.get('/osm/tiles', hasHereAccessToContainerWithCoords, getOSMTile);

	// /** */
	router.get('/here/default/tiles', hasHereAccessToContainerWithCoords, getHereDefaultTile);

	// /** */
	router.get('/here/aerial/tiles', hasHereAccessToContainerWithCoords, getHereAerialTile);

	// /** */
	router.get('/here/traffic/tiles', hasHereAccessToContainerWithCoords, getHereTrafficTile);

	// /** */
	router.get('/here/trafficflow/tiles', hasHereAccessToContainerWithCoords, getHereTrafficFlowTile);

	// /** */
	router.get('/here/terrain/tiles', hasHereAccessToContainerWithCoords, getHereTerrainTile);

	// /** */
	router.get('/here/hybrid/tiles', hasHereAccessToContainerWithCoords, getHereHybridTile);

	// /** */
	router.get('/here/grey/tiles', hasHereAccessToContainerWithCoords, getHereGreyTile);

	// /** */
	router.get('/here/truck/tiles', hasHereAccessToContainerWithCoords, getHereTruckRestrictionsTile);

	// /** */
	router.get('/here/truckoverlay/tiles', hasHereAccessToContainerWithCoords, getHereTruckOverlayTile);

	// /** */
	router.get('/here/labeloverlay/tiles', hasHereAccessToContainerWithCoords, getHereLabelOverlayTile);

	// /** */
	router.get('/here/tollzone/tiles', hasHereAccessToContainerWithCoords, getHereTollZoneTile);

	// /** */
	router.get('/here/poi/tiles', hasHereAccessToContainerWithCoords, getHerePOITile);

	return router;
};

module.exports = establishRoutes;
