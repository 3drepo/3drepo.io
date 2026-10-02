/**
 *  Copyright (C) 2019 3D Repo Ltd
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
 * @apiDefine Risks SafetiBase Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 */

/**
 * @apiDefine RiskIdParam
 *
 * @apiParam {String} riskId Risk ID
 */

/**
 * @apiDefine viewpointObject
 *
 * @apiBody (Viewpoint) {Number[]} right Right vector of the camera
 * @apiBody (Viewpoint) {Number[]} up Up vector of the camera
 * @apiBody (Viewpoint) {Number[]} position Position of the camera
 * @apiBody (Viewpoint) {Number[]} look_at Look at point of the camera
 * @apiBody (Viewpoint) {Number[]} view_dir View direction of the camera
 * @apiBody (Viewpoint) {Number} near Near clipping plane
 * @apiBody (Viewpoint) {Number} far Far clipping plane
 * @apiBody (Viewpoint) {Number} fov Field of view in radians
 * @apiBody (Viewpoint) {Number} aspect_ratio Aspect ratio of the viewport
 * @apiBody (Viewpoint) {Object[]} [clippingPlanes] Array of clipping planes
 * @apiBody (Viewpoint) {Object[]} [override_groups] Array of override groups with colors and objects
 * @apiBody (Viewpoint) {Object[]} [transformation_groups] Array of transformation groups
 * @apiBody (Viewpoint) {Object} [highlighted_group] Highlighted group with objects and color
 * @apiBody (Viewpoint) {Object} [hidden_group] Hidden group with objects
 * @apiBody (Viewpoint) {Boolean} [hideIfc] Flag to hide IFC elements
 * @apiBody (Viewpoint) {String} [screenshot] Base64 encoded screenshot image
 * @apiBody (Viewpoint) {String} [guid] Unique identifier for the viewpoint
 */

/**
 * @apiDefine viewpointResponse
 *
 * @apiSuccess (Viewpoint) {Number[]} right Right vector of the camera
 * @apiSuccess (Viewpoint) {Number[]} up Up vector of the camera
 * @apiSuccess (Viewpoint) {Number[]} position Position of the camera
 * @apiSuccess (Viewpoint) {Number[]} look_at Look at point of the camera
 * @apiSuccess (Viewpoint) {Number[]} view_dir View direction of the camera
 * @apiSuccess (Viewpoint) {Number} near Near clipping plane
 * @apiSuccess (Viewpoint) {Number} far Far clipping plane
 * @apiSuccess (Viewpoint) {Number} fov Field of view in radians
 * @apiSuccess (Viewpoint) {Number} aspect_ratio Aspect ratio of the viewport
 * @apiSuccess (Viewpoint) {Object[]} [clippingPlanes] Array of clipping planes
 * @apiSuccess (Viewpoint) {Object[]} [override_groups] Array of override groups with colors and objects
 * @apiSuccess (Viewpoint) {Object[]} [transformation_groups] Array of transformation groups
 * @apiSuccess (Viewpoint) {Object} [highlighted_group] Highlighted group with objects and color
 * @apiSuccess (Viewpoint) {Object} [hidden_group] Hidden group with objects
 * @apiSuccess (Viewpoint) {Boolean} [hideIfc] Flag to hide IFC elements
 * @apiSuccess (Viewpoint) {String} [screenshot] URL to screenshot image
 * @apiSuccess (Viewpoint) {String} [screenshotSmall] URL to small screenshot image
 * @apiSuccess (Viewpoint) {String} [guid] Unique identifier for the viewpoint
 */

/**
 * @apiDefine risksCreationPayload
 *
 *  @apiBody {String} name Risk name
 *  @apiBody {String[]} assigned_roles Risk owner
 *  @apiBody {String} associated_activity Associated activity
 *  @apiBody {String} category Category
 *  @apiBody {Number} consequence Risk consequence (0: very low, 1: low, 2: moderate, 3: high, 4: very high)
 *  @apiBody {String} desc Risk description
 *  @apiBody {String} element Element type
 *  @apiBody {Number} likelihood Risk likelihood (0: very low, 1: low, 2: moderate, 3: high, 4: very high)
 *  @apiBody {String} location_desc Location description
 *  @apiBody {String} mitigation_status Treatment status
 *  @apiBody {String} mitigation_desc Treatment summary
 *  @apiBody {String} mitigation_detail Treatment detailed description
 *  @apiBody {String} mitigation_stage Treatment stage
 *  @apiBody {String} mitigation_type Treatment type
 *  @apiBody {Number{3..3}} position Risk pin coordinates
 *  @apiBody {Number} residual_consequence Treated risk consequence (-1: unset, 0: very low, 1: low, 2: moderate, 3: high, 4: very high)
 *  @apiBody {Number} residual_likelihood Treated risk likelihood (-1: unset, 0: very low, 1: low, 2: moderate, 3: high, 4: very high)
 *  @apiBody {String} residual_risk Residual risk
 *  @apiBody {String} risk_factor Risk factor
 *  @apiBody {String} scope Construction scope
 *  @apiUse viewpointObject
 */

/**
 * @api {get} /:teamspace/:model/risks/:riskId Get a risk
 * @apiName findRiskById
 * @apiGroup Risks
 * @apiDescription Route has been decommissioned.
 */
router.get("/risks/:riskId", routeDecommissioned());

/**
 * @api {get} /:teamspace/:model/risks/:riskId/thumbnail.png Get risk thumbnail
 * @apiName getThumbnail
 * @apiGroup Risks
 * @apiDescription Route has been decommissioned.
 */
router.get("/risks/:riskId/thumbnail.png", routeDecommissioned());

/**
 * @api {get} /:teamspace/:model/risks List all risks
 * @apiName listRisks
 * @apiGroup Risks
 * @apiDescription Route has been decommissioned.
 */

/**
 * @api {get} /:teamspace/:model/revision/:revId/risks List all risks of a revision
 * @apiName listRisksByRevision
 * @apiGroup Risks
 * @apiDescription Route has been decommissioned.
 */
router.get("/risks", routeDecommissioned());

/**
 * @api {get} /:teamspace/:model/risks/:riskId/screenshot.png Get risk screenshot
 * @apiName getScreenshot
 * @apiGroup Risks
 * @apiDescription Route has been decommissioned.
 */
router.get("/risks/:riskId/viewpoints/:vid/screenshot.png", routeDecommissioned());

/**
 * @api {get} /:teamspace/:model/risks/:riskId/screenshotSmall.png Get low-res screenshot
 * @apiName getScreenshotSmall
 * @apiGroup Risks
 * @apiDescription Route has been decommissioned.
 */
router.get("/risks/:riskId/viewpoints/:vid/screenshotSmall.png", routeDecommissioned());

router.get("/revision/:rid/risks", routeDecommissioned());

/**
 * @api {get} /:teamspace/:model/risks.html Render risks as HTML
 * @apiName renderRisksHTML
 * @apiGroup Risks
 * @apiDescription Route has been decommissioned.
 */

/**
 * @api {get} /:teamspace/:model/revision/:revId/risks.html Render risks for a revision as HTML
 * @apiName renderRisksByRevisionHTML
 * @apiGroup Risks
 * @apiDescription Route has been decommissioned.
 */
router.get("/risks.html", routeDecommissioned());

router.get("/revision/:rid/risks.html", routeDecommissioned());

/**
 * @api {post} /:teamspace/:model/revision/:revId/risks Create a risk for a revision
 * @apiName storeRiskForRevision
 * @apiGroup Risks
 * @apiDescription Route has been decommissioned.
 */

/**
 * @api {post} /:teamspace/:model/risks Create a risk
 * @apiName storeRisk
 * @apiGroup Risks
 * @apiDescription Route has been decommissioned.
 */
router.post("/risks", routeDecommissioned());

/**
 * @api {patch} /:teamspace/:model/revision/:revId/risks/:riskId Update risk for a revision
 * @apiName updateRiskForRevision
 * @apiGroup Risks
 * @apiDescription Route has been decommissioned.
 */

/**
 * @api {patch} /:teamspace/:model/risks/:riskId Update risk
 * @apiName updateRisk
 * @apiGroup Risks
 * @apiDescription Route has been decommissioned.
 */
router.patch("/risks/:riskId", routeDecommissioned());

router.post("/revision/:rid/risks", routeDecommissioned());

router.patch("/revision/:rid/risks/:riskId", routeDecommissioned());

/**
 * @api {post} /:teamspace/:model/risks/:riskId/comments Add a comment
 * @apiName commentRisk
 * @apiGroup Risks
 * @apiDescription Route has been decommissioned.
 **/
router.post("/risks/:riskId/comments", routeDecommissioned());

/**
 * @api {delete} /:teamspace/:model/risks/:riskId/comments Delete a comment
 * @apiName deleteComment
 * @apiGroup Risks
 * @apiDescription Route has been decommissioned.
 **/
router.delete("/risks/:riskId/comments", routeDecommissioned());

/**
 * @api {post} /:teamspace/:model/risks/:riskId/resources Attach resources to a risk
 * @apiName attachResourceRisk
 * @apiGroup Risks
 * @apiDescription Route has been decommissioned.
 */
router.post("/risks/:riskId/resources", routeDecommissioned());

/**
 * @api {delete} /:teamspace/:model/risks/:riskId/resources Detach a resource from a risk
 * @apiName detachResourceRisk
 * @apiGroup Risks
 * @apiDescription Route has been decommissioned.
 */
router.delete("/risks/:riskId/resources", routeDecommissioned());

module.exports = router;
