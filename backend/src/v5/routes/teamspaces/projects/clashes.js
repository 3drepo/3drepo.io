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

const { planExists, validateNewPlanData, validateUpdatePlanData } = require('../../../middleware/dataConverter/inputs/teamspaces/projects/clashes');
const Clashes = require('../../../processors/teamspaces/projects/clashes');
const { Router } = require('express');
const { UUIDToString } = require('../../../utils/helper/uuids');
const { isAdminToProject } = require('../../../middleware/permissions');
const { respond } = require('../../../utils/responder');
const { templates } = require('../../../utils/responseCodes');

const createPlan = async (req, res) => {
	const { teamspace } = req.params;
	try {
		const planId = await Clashes.createPlan(teamspace, req.body, req.user);
		respond(req, res, templates.ok, { _id: UUIDToString(planId) });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const updatePlan = async (req, res) => {
	const { teamspace, planId } = req.params;
	try {
		await Clashes.updatePlan(teamspace, planId, req.body);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const deletePlan = async (req, res) => {
	const { teamspace, planId } = req.params;
	try {
		await Clashes.deletePlan(teamspace, planId);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/clash:
	 *   post:
	 *     description: Creates a new clash test plan
	 *     tags: [v:external, Clashes]
	 *     operationId: createClashtestPlan
	 *     parameters:
	 *       - name: teamspace
	 *         description: name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: ID of project
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               name:
	 *                 type: string
	 *                 description: The name of plan
	 *                 example: plan 1
	 *               type:
	 *                 type: string
	 *                 description: The type of plan
	 *                 enum: [hard, clearance]
	 *                 example: clearance
	 *               tolerance:
	 *                 type: number
	 *                 description: The tolerance of plan (in mm)
	 *                 example: 5
	 *               selfIntersectionsCheck:
	 *                 type: boolean
	 *                 description: Whether to check for self intersections
	 *                 example: true
	 *                 enum: [selectionA, selectionB, true, false]
	 *               trigger:
	 *                 type: array
	 *                 description: The trigger options for the plan
	 *                 items:
	 *                   type: string
	 *                   enum: [manual, new revision]
	 *                   example: [manual, new revision]
	 *               selectionA:
	 *                 type: object
	 *                 description: The selection A of the plan
	 *                 properties:
	 *                   container:
	 *                     type: string
	 *                     description: The container of selection A
	 *                     format: uuid
	 *                     example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 *                   rules:
	 *                     type: array
	 *                     description: The rules applied to selection A
	 *                     items:
	 *                       $ref: '#/components/schemas/ticketGroupRules'
	 *               selectionB:
	 *                 type: object
	 *                 description: The selection B of the plan
	 *                 properties:
	 *                   container:
	 *                     type: string
	 *                     description: The container of selection B
	 *                     format: uuid
	 *                     example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 *                   rules:
	 *                     type: array
	 *                     description: The rules applied to selection B
	 *                     items:
	 *                       $ref: '#/components/schemas/ticketGroupRules'
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Create a new clash test plan
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 _id:
	 *                   type: string
	 *                   format: uuid
	 *                   description: The id of the new clash test plan
	 *                   example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 */
	router.post('/', isAdminToProject, validateNewPlanData, createPlan);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/clash/{planId}:
	 *   patch:
	 *     description: Updates a clash test plan
	 *     tags: [v:external, Clashes]
	 *     operationId: updateClashTestPlan
	 *     parameters:
	 *       - name: teamspace
	 *         description: name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: ID of project
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: planId
	 *         description: ID of plan
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               name:
	 *                 type: string
	 *                 description: The name of plan
	 *                 example: plan 1
	 *               type:
	 *                 type: string
	 *                 description: The type of plan
	 *                 enum: [hard, clearance]
	 *                 example: clearance
	 *               tolerance:
	 *                 type: number
	 *                 description: The tolerance of plan (in mm)
	 *                 example: 5
	 *               selfIntersectionsCheck:
	 *                 type: boolean
	 *                 description: Whether to check for self intersections
	 *                 example: true
	 *                 enum: [selectionA, selectionB, true, false]
	 *               trigger:
	 *                 type: array
	 *                 description: The trigger options for the plan
	 *                 items:
	 *                   type: string
	 *                   enum: [manual, new revision]
	 *                   example: [manual, new revision]
	 *               selectionA:
	 *                 type: object
	 *                 description: The selection A of the plan
	 *                 properties:
	 *                   container:
	 *                     type: string
	 *                     description: The container of selection A
	 *                     format: uuid
	 *                     example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 *                   rules:
	 *                     type: array
	 *                     description: The rules applied to selection A
	 *                     items:
	 *                       $ref: '#/components/schemas/ticketGroupRules'
	 *               selectionB:
	 *                 type: object
	 *                 description: The selection B of the plan
	 *                 properties:
	 *                   container:
	 *                     type: string
	 *                     description: The container of selection B
	 *                     format: uuid
	 *                     example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 *                   rules:
	 *                     type: array
	 *                     description: The rules applied to selection B
	 *                     items:
	 *                       $ref: '#/components/schemas/ticketGroupRules'
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Update a clash test plan
	 */
	router.patch('/:planId', isAdminToProject, validateUpdatePlanData, updatePlan);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/clash/{planId}:
	 *   delete:
	 *     description: Deletes a clash test plan
	 *     tags: [v:external, Clashes]
	 *     operationId: deleteClashTestPlan
	 *     parameters:
	 *       - name: teamspace
	 *         description: name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: ID of project
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: planId
	 *         description: ID of plan
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Delete a clash test plan
	 */
	router.delete('/:planId', isAdminToProject, planExists, deletePlan);

	return router;
};

module.exports = establishRoutes();
