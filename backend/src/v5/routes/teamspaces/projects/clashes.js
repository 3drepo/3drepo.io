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

const {
	clashRunInPlan,
	planContainersHaveRevs,
	planExists,
	validateNewPlanData,
	validateUpdatePlanData,
} = require('../../../middleware/dataConverter/inputs/teamspaces/projects/clashes');
const {
	serialiseClashPlan,
	serialiseClashPlans,
	serialiseClashRun,
	serialiseClashRuns,
} = require('../../../middleware/dataConverter/outputs/teamspaces/projects/clashes');
const Clashes = require('../../../processors/teamspaces/projects/clashes');
const { Router } = require('express');
const { UUIDToString } = require('../../../utils/helper/uuids');
const { getUserFromSession } = require('../../../utils/sessions');
const { isAdminToProject } = require('../../../middleware/permissions');
const { respond } = require('../../../utils/responder');
const { templates } = require('../../../utils/responseCodes');

const createPlan = async (req, res) => {
	const user = getUserFromSession(req.session);
	const { teamspace, project } = req.params;
	try {
		const planId = await Clashes.createPlan(teamspace, project, req.body, user);
		respond(req, res, templates.ok, { _id: UUIDToString(planId) });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const updatePlan = async (req, res) => {
	const user = getUserFromSession(req.session);
	const { teamspace, project, planId } = req.params;
	try {
		await Clashes.updatePlan(teamspace, project, planId, req.body, user);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const deletePlan = async (req, res) => {
	const { teamspace, project, planId } = req.params;
	try {
		await Clashes.deletePlan(teamspace, project, planId);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const createRun = async (req, res) => {
	const user = getUserFromSession(req.session);
	const { teamspace, project } = req.params;
	try {
		const _id = await Clashes.createRun(teamspace, project, req.planData, user);
		respond(req, res, templates.ok, { _id: UUIDToString(_id) });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getAllPlans = async (req, res, next) => {
	const { teamspace, project } = req.params;
	try {
		req.outputData = await Clashes.getAllPlans(teamspace, project, {
			type: 1,
			name: 1,
			createdAt: 1,
			createdBy: 1,
			updatedAt: 1,
			updatedBy: 1,
		});
		next();
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getPlan = async (req, res, next) => {
	const { teamspace, project, planId } = req.params;
	try {
		req.outputData = await Clashes.getPlanById(teamspace, project, planId);
		next();
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getRuns = async (req, res, next) => {
	const { teamspace, project, planId } = req.params;
	try {
		req.outputData = await Clashes.getClashRunsByPlan(teamspace, project, planId, {
			project: 0,
			plan: 0,
		});
		next();
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/clashes:
	 *   get:
	 *     description: Returns a summary list of all clash test plans within the specified project
	 *     tags: [v:external, Clashes]
	 *     operationId: getAllClashTestPlans
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
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Returns all clash test plans for the project
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 plans:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       _id:
	 *                         type: string
	 *                         format: uuid
	 *                         description: The ID of the clash test plan
	 *                         example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 *                       name:
	 *                         type: string
	 *                         description: The name of the plan
	 *                         example: plan 1
	 *                       type:
	 *                         type: string
	 *                         description: The type of the plan
	 *                         enum: [hard, clearance]
	 *                         example: clearance
	 *                       createdAt:
	 *                         type: integer
	 *                         description: Epoch timestamp in milliseconds when the plan was created
	 *                       createdBy:
	 *                         type: string
	 *                         description: The username of the user who created the plan
	 *                         example: username1
	 *                       updatedAt:
	 *                         type: integer
	 *                         description: Epoch timestamp in milliseconds when the plan was last updated (only present if the plan has been updated)
	 *                       updatedBy:
	 *                         type: string
	 *                         description: The username of the user who last updated the plan (only present if the plan has been updated)
	 *                         example: username1
	 */
	router.get('/', isAdminToProject, getAllPlans, serialiseClashPlans);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/clashes:
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
	 *                 example: [manual, new revision]
	 *                 items:
	 *                   type: string
	 *                   enum: [manual, new revision]
	 *                   example: manual
	 *               selectionA:
	 *                 type: array
	 *                 description: The selections for set A of the plan
	 *                 minItems: 1
	 *                 items:
	 *                   type: object
	 *                   properties:
	 *                     container:
	 *                       type: string
	 *                       description: The container of a selection A entry
	 *                       format: uuid
	 *                       example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 *                     rules:
	 *                       type: array
	 *                       description: The rules applied to the selection A entry
	 *                       items:
	 *                         $ref: '#/components/schemas/ticketGroupRules'
	 *               selectionB:
	 *                 type: array
	 *                 description: The selections for set B of the plan
	 *                 minItems: 1
	 *                 items:
	 *                   type: object
	 *                   properties:
	 *                     container:
	 *                       type: string
	 *                       description: The container of a selection B entry
	 *                       format: uuid
	 *                       example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 *                     rules:
	 *                       type: array
	 *                       description: The rules applied to the selection B entry
	 *                       items:
	 *                         $ref: '#/components/schemas/ticketGroupRules'
	 *               tickets:
	 *                 type: object
	 *                 description: Ticket creation settings for clashes
	 *                 properties:
	 *                   federation:
	 *                     type: string
	 *                     format: uuid
	 *                     description: The federation where clash tickets will be created
	 *                     example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 *                   template:
	 *                     type: string
	 *                     format: uuid
	 *                     description: The ticket template used to create clash tickets
	 *                     example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 *                   creator:
	 *                     type: string
	 *                     description: The user ID to create clash tickets as; defaults to the current user
	 *                     example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 *                   valuesAtCreation:
	 *                     type: array
	 *                     description: Ticket property values to apply when clash tickets are created
	 *                     items:
	 *                       type: object
	 *                       properties:
	 *                         property:
	 *                           type: string
	 *                           description: The property name
	 *                           example: Priority
	 *                         module:
	 *                           type: string
	 *                           description: The module name; omitted for top-level ticket properties
	 *                           example: clash
	 *                         value:
	 *                           description: The value to set on the property
	 *                           nullable: true
	 *                       required:
	 *                         - property
	 *                         - value
	 *                   defaultStatuses:
	 *                     type: object
	 *                     description: Status to set when a certain event happens
	 *                     properties:
	 *                       onNew:
	 *                         type: string
	 *                         description: Set the ticket status for newly created clash tickets
	 *                         example: Open
	 *                       onResolved:
	 *                         type: string
	 *                         description: Set the ticket status for resolved clash tickets
	 *                         example: Closed
	 *                       onReopened:
	 *                         type: string
	 *                         description: Set the ticket status for reopened clash tickets
	 *                         example: Open
	 *                   hideOtherObjects:
	 *                     type: boolean
	 *                     description: Hide all objects outside the clash objects in generated ticket views; false is omitted
	 *                     example: true
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
	 * /teamspaces/{teamspace}/projects/{project}/clashes/{planId}:
	 *   get:
	 *     description: Returns the full details of a single clash test plan by ID
	 *     tags: [v:external, Clashes]
	 *     operationId: getClashTestPlan
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
	 *           format: uuid
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/clashPlanNotFound"
	 *       200:
	 *         description: Returns the clash test plan
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 _id:
	 *                   type: string
	 *                   format: uuid
	 *                   description: The ID of the clash test plan
	 *                   example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 *                 name:
	 *                   type: string
	 *                   description: The name of the plan
	 *                   example: plan 1
	 *                 type:
	 *                   type: string
	 *                   description: The type of the plan
	 *                   enum: [hard, clearance]
	 *                   example: clearance
	 *                 tolerance:
	 *                   type: number
	 *                   description: The tolerance of the plan (in mm)
	 *                   example: 5
	 *                 selfIntersectionsCheck:
	 *                   description: Whether and how self intersections are checked
	 *                   example: selectionA
	 *                   oneOf:
	 *                     - type: string
	 *                       enum: [selectionA, selectionB]
	 *                     - type: boolean
	 *                 trigger:
	 *                   type: array
	 *                   description: The trigger options for the plan
	 *                   items:
	 *                     type: string
	 *                     enum: [manual, new revision]
	 *                 selectionA:
	 *                   type: array
	 *                   description: The selections for set A of the plan
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       container:
	 *                         type: string
	 *                         format: uuid
	 *                         description: The container of a selection A entry
	 *                         example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 *                       rules:
	 *                         type: array
	 *                         description: The rules applied to the selection A entry
	 *                         items:
	 *                           $ref: '#/components/schemas/ticketGroupRules'
	 *                 selectionB:
	 *                   type: array
	 *                   description: The selections for set B of the plan
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       container:
	 *                         type: string
	 *                         format: uuid
	 *                         description: The container of a selection B entry
	 *                         example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 *                       rules:
	 *                         type: array
	 *                         description: The rules applied to the selection B entry
	 *                         items:
	 *                           $ref: '#/components/schemas/ticketGroupRules'
	 *                 tickets:
	 *                   type: object
	 *                   description: Ticket creation settings for clashes
	 *                   nullable: true
	 *                   properties:
	 *                     federation:
	 *                       type: string
	 *                       format: uuid
	 *                       description: The federation where clash tickets will be created
	 *                       example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 *                     template:
	 *                       type: string
	 *                       format: uuid
	 *                       description: The ticket template used to create clash tickets
	 *                       example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 *                     creator:
	 *                       type: string
	 *                       description: The user to create clash tickets as
	 *                       example: user@example.com
	 *                     valuesAtCreation:
	 *                       type: array
	 *                       description: Ticket property values to apply when clash tickets are created
	 *                       nullable: true
	 *                       items:
	 *                         type: object
	 *                         properties:
	 *                           property:
	 *                             type: string
	 *                             description: The property name
	 *                             example: Priority
	 *                           module:
	 *                             type: string
	 *                             description: The module name; omitted for top-level ticket properties
	 *                             example: clash
	 *                           value:
	 *                             description: The value to set on the property
	 *                             nullable: true
	 *                         required:
	 *                           - property
	 *                           - value
	 *                     defaultStatuses:
	 *                       type: object
	 *                       description: Optional default statuses; removed when no fields remain
	 *                       nullable: true
	 *                       properties:
	 *                         onNew:
	 *                           type: string
	 *                           description: Default status for newly created clash tickets
	 *                           example: Open
	 *                         onResolved:
	 *                           type: string
	 *                           description: Default status for resolved clash tickets
	 *                           example: Closed
	 *                         onReopened:
	 *                           type: string
	 *                           description: Default status for reopened clash tickets
	 *                           example: Open
	 *                 createdAt:
	 *                   type: integer
	 *                   description: Epoch timestamp in milliseconds when the plan was created
	 *                 createdBy:
	 *                   type: string
	 *                   description: The username of the user who created the plan
	 *                   example: username1
	 *                 updatedAt:
	 *                   type: integer
	 *                   description: Epoch timestamp in milliseconds when the plan was last updated (only present if the plan has been updated)
	 *                 updatedBy:
	 *                   type: string
	 *                   description: The username of the user who last updated the plan (only present if the plan has been updated)
	 *                   example: username1
	 */
	router.get('/:planId', isAdminToProject, getPlan, serialiseClashPlan);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/clashes/{planId}:
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
	 *                 example: [manual, new revision]
	 *                 items:
	 *                   type: string
	 *                   enum: [manual, new revision]
	 *                   example: manual
	 *               selectionA:
	 *                 type: array
	 *                 description: The selections for set A of the plan
	 *                 minItems: 1
	 *                 items:
	 *                   type: object
	 *                   properties:
	 *                     container:
	 *                       type: string
	 *                       description: The container of a selection A entry
	 *                       format: uuid
	 *                       example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 *                     rules:
	 *                       type: array
	 *                       description: The rules applied to the selection A entry
	 *                       items:
	 *                         $ref: '#/components/schemas/ticketGroupRules'
	 *               selectionB:
	 *                 type: array
	 *                 description: The selections for set B of the plan
	 *                 minItems: 1
	 *                 items:
	 *                   type: object
	 *                   properties:
	 *                     container:
	 *                       type: string
	 *                       description: The container of a selection B entry
	 *                       format: uuid
	 *                       example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 *                     rules:
	 *                       type: array
	 *                       description: The rules applied to the selection B entry
	 *                       items:
	 *                         $ref: '#/components/schemas/ticketGroupRules'
	 *               tickets:
	 *                 type: object
	 *                 description: Ticket creation settings for clashes
	 *                 nullable: true
	 *                 properties:
	 *                   federation:
	 *                     type: string
	 *                     format: uuid
	 *                     description: The federation where clash tickets will be created
	 *                     example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 *                   template:
	 *                     type: string
	 *                     format: uuid
	 *                     description: The ticket template used to create clash tickets
	 *                     example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 *                   creator:
	 *                     type: string
	 *                     description: The user to create clash tickets as
	 *                     example: user@example.com
	 *                   valuesAtCreation:
	 *                     type: array
	 *                     description: Ticket property values to apply when clash tickets are created
	 *                     nullable: true
	 *                     items:
	 *                       type: object
	 *                       properties:
	 *                         property:
	 *                           type: string
	 *                           description: The property name
	 *                           example: Priority
	 *                         module:
	 *                           type: string
	 *                           description: The module name; omitted for top-level ticket properties
	 *                           example: clash
	 *                         value:
	 *                           description: The value to set on the property
	 *                           nullable: true
	 *                       required:
	 *                         - property
	 *                         - value
	 *                   defaultStatuses:
	 *                     type: object
	 *                     description: Optional default statuses; removed when no fields remain
	 *                     nullable: true
	 *                     properties:
	 *                       onNew:
	 *                         type: string
	 *                         description: Default status for newly created clash tickets
	 *                         example: Open
	 *                       onResolved:
	 *                         type: string
	 *                         description: Default status for resolved clash tickets
	 *                         example: Closed
	 *                       onReopened:
	 *                         type: string
	 *                         description: Default status for reopened clash tickets
	 *                         example: Open
	 *                   hideOtherObjects:
	 *                     type: boolean
	 *                     nullable: true
	 *                     description: Hide all objects outside the clash objects in generated ticket views; false is omitted, null removes the flag
	 *                     example: true
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Update a clash test plan
	 */
	router.patch('/:planId', isAdminToProject, validateUpdatePlanData, updatePlan);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/clashes/{planId}:
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

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/clashes/{planId}/runs:
	 *   get:
	 *     description: Returns all clash test runs associated with a given plan, sorted by most recent first
	 *     tags: [v:external, Clashes]
	 *     operationId: getClashTestRuns
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
	 *           format: uuid
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/clashPlanNotFound"
	 *       200:
	 *         description: Returns all clash test runs for the plan
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 runs:
	 *                   type: array
	 *                   description: List of clash test runs, sorted by triggeredAt descending
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       _id:
	 *                         type: string
	 *                         format: uuid
	 *                         description: The ID of the clash test run
	 *                         example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 *                       status:
	 *                         type: string
	 *                         description: The current status of the run
	 *                         enum: [planned, queued, failed, completed, aborted]
	 *                         example: completed
	 *                       triggeredAt:
	 *                         type: integer
	 *                         description: Epoch timestamp in milliseconds when the run was triggered
	 *                       triggeredBy:
	 *                         type: string
	 *                         description: The username of the user who triggered the run
	 *                         example: username1
	 *                       updatedAt:
	 *                         type: integer
	 *                         description: Epoch timestamp in milliseconds when the run was last updated
	 *                       results:
	 *                         type: object
	 *                         description: >
	 *                           Present when status is completed or failed.
	 *                           Contains stats on completion, or an error object on failure.
	 *                         properties:
	 *                           stats:
	 *                             type: object
	 *                             description: Run statistics (only present when status is completed)
	 *                           error:
	 *                             type: object
	 *                             description: Error details (only present when status is failed)
	 *                             properties:
	 *                               code:
	 *                                 type: string
	 *                                 description: The error code
	 *                               reason:
	 *                                 type: string
	 *                                 description: A human-readable description of the failure
	 */
	router.get('/:planId/runs', isAdminToProject, planExists, getRuns, serialiseClashRuns);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/clashes/{planId}/runs/{runId}:
	 *   get:
	 *     description: Returns the full details of a single clash test run by ID
	 *     tags: [v:external, Clashes]
	 *     operationId: getClashTestRun
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
	 *           format: uuid
	 *       - name: runId
	 *         description: ID of run
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/clashRunNotFound"
	 *       200:
	 *         description: Returns the clash test run, including the copied clash config snapshot used for the run
	 */
	router.get('/:planId/runs/:runId', isAdminToProject, planExists, clashRunInPlan, serialiseClashRun);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/clashes/{planId}/runs:
	 *   post:
	 *     description: Create a clash run based on the plan
	 *     tags: [v:external, Clashes]
	 *     operationId: createClashRun
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
	 *         description: Create a clash run based on the plan
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 _id:
	 *                   type: string
	 *                   format: uuid
	 *                   description: The id of the new clash run
	 *                   example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 */
	router.post('/:planId/runs', isAdminToProject, planExists, planContainersHaveRevs, createRun);

	return router;
};

module.exports = establishRoutes();
