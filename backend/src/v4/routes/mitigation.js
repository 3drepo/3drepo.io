/**
 *  Copyright (C) 2020 3D Repo Ltd
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

"use strict";

const express = require("express");
const router = express.Router({ mergeParams: true });

const { v5Path } = require("../../interop");
const { routeDecommissioned } = require(`${v5Path}/middleware/common`);

/**
 * @api {get} /:teamspace/mitigations/criteria Get mitigation criteria
 * @apiName findMitigationCriteria
 * @apiGroup Risks
 * @apiDescription Route has been decommissioned.
 */
router.get("/mitigations/criteria", routeDecommissioned());

/**
 * @api {post} /:teamspace/mitigations Find mitigation suggestions
 * @apiName findMitigationSuggestions
 * @apiGroup Risks
 * @apiDescription Route has been decommissioned.
 */
router.post("/mitigations", routeDecommissioned());

module.exports = router;
