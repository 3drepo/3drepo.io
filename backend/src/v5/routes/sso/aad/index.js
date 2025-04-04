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

const { Router } = require('express');
const { routeDecommissioned } = require('../../../middleware/common');

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	router.get('/authenticate', routeDecommissioned());

	router.post('/signup', routeDecommissioned());

	router.get('/link', routeDecommissioned());

	return router;
};

module.exports = establishRoutes();
