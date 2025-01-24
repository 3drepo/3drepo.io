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

const { canRemoveTeamspaceMember, memberExists } = require('../../middleware/dataConverter/inputs/teamspaces');
const { Router } = require('express');
const Teamspaces = require('../../processors/teamspaces/teamspaces');
const { fileExtensionFromBuffer } = require('../../utils/helper/typeCheck');
const { hasAccessToTeamspace } = require('../../middleware/permissions/permissions');
const { isTeamspaceAdmin } = require('../../middleware/permissions/permissions');
const { respond } = require('../../utils/responder');
const { templates } = require('../../utils/responseCodes');
const { validSession } = require('../../middleware/auth');

const getTeamspaceList = async (req, res) => {
	const user = req.session.user.username;
	try {
		const teamspaces = await Teamspaces.getTeamspaceListByUser(user);
		respond(req, res, templates.ok, { teamspaces });
	} catch (err) {
		/* istanbul ignore next */
		respond(req, res, err);
	}
};

const getTeamspaceMembers = async (req, res) => {
	const { teamspace } = req.params;
	try {
		const members = await Teamspaces.getTeamspaceMembersInfo(teamspace);
		respond(req, res, templates.ok, { members });
	} catch (err) {
		/* istanbul ignore next */
		respond(req, res, err);
	}
};

const getAvatar = async (req, res) => {
	try {
		const { teamspace } = req.params;
		const buffer = await Teamspaces.getAvatar(teamspace);
		const fileExt = await fileExtensionFromBuffer(buffer);
		req.params.format = fileExt || 'png';
		respond(req, res, templates.ok, buffer);
	} catch (err) {
		/* istanbul ignore next */
		respond(req, res, err);
	}
};

const getTeamspaceMemberAvatar = async (req, res) => {
	try {
		const { member } = req.params;
		const buffer = await Teamspaces.getAvatar(member);
		const fileExt = await fileExtensionFromBuffer(buffer);
		req.params.format = fileExt || 'png';
		respond(req, res, templates.ok, buffer);
	} catch (err) {
		/* istanbul ignore next */
		respond(req, res, err);
	}
};

const getQuotaInfo = async (req, res) => {
	const { teamspace } = req.params;

	try {
		const quotaInfo = await Teamspaces.getQuotaInfo(teamspace);
		respond(req, res, templates.ok, quotaInfo);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const removeTeamspaceMember = async (req, res) => {
	const { teamspace, username } = req.params;

	try {
		await Teamspaces.removeTeamspaceMember(teamspace, username);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getAddOns = async (req, res) => {
	const { teamspace } = req.params;

	try {
		const addOns = await Teamspaces.getAddOns(teamspace);
		respond(req, res, templates.ok, addOns);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	/**
	 * @openapi
	 * /teamspaces:
	 *   get:
	 *     description: Get a list of teamspaces the user has access to
	 *     tags: [Teamspaces]
	 *     operationId: getTeamspaceList
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: returns list of teamspace
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 teamspaces:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       name:
	 *                         type: string
	 *                         description: name of the teamspace
	 *                         example: teamspace1
	 *                       isAdmin:
	 *                         type: boolean
	 *                         description: whether the user is an admin
	 *
	 *
	 */
	router.get('/', validSession, getTeamspaceList);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/members:
	 *   get:
	 *     description: Get the list of members within the teamspace
	 *     tags: [Teamspaces]
	 *     operationId: getTeamspaceMembers
	 *     parameters:
   	 *       - name: teamspace
	 *         description: name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: returns list of teamspace members with their basic information
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 members:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       user:
	 *                         type: string
	 *                         description: User name
	 *                         example: johnPaul01
	 *                       firstName:
	 *                         type: string
	 *                         description: First name
	 *                         example: John
	 *                       lastName:
	 *                         type: string
	 *                         description: Last name
	 *                         example: Paul
	 *                       company:
	 *                         type: string
	 *                         description: Name of the company
	 *                         example: 3D Repo Ltd
	 *                       jobs:
	 *                         type: array
	 *                         items:
	 *                           type: string
	 *                           format: uuid
	 *                           description: Jobs the user is assigned to
	 *                           example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 *
	 */
	router.get('/:teamspace/members', hasAccessToTeamspace, getTeamspaceMembers);

	/**
	* @openapi
	* /teamspaces/{teamspace}/avatar:
	*   get:
	*     description: Gets the avatar of the teamspace
	*     tags: [Teamspaces]
	*     parameters:
   	*       - name: teamspace
	*         description: name of teamspace
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*     operationId: getTeamspaceAvatar
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: Gets the avatar of the Teamspace
	*         content:
	*           image/png:
	*             schema:
	*               type: string
	*               format: binary
	*/
	router.get('/:teamspace/avatar', hasAccessToTeamspace, getAvatar);

	/**
	* @openapi
	* /teamspaces/{teamspace}/quota:
	*   get:
	*     description: Gets quota information about a user
	*     tags: [Teamspaces]
	*     parameters:
   	*       - name: teamspace
	*         description: name of teamspace
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*     operationId: getQuotaInfo
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: Gets the quota information of the user
	*         content:
	*           application/json:
	*             schema:
	*               type: object
	*               properties:
	*                 freeTier:
	*                   type: boolean
	*                   description: Whether or not the user has a paid subscription
	*                   example: true
	*                 expiryDate:
	*                   type: number
	*                   description: The closest expiry date of a users active plan (in epoch)
	*                   example: 1233445
	*                 data:
	*                   type: object
	*                   properties:
	*                     used:
	*                       type: number
	*                       description: The number of bytes the user is currently using
	*                       example: 1000000
	*                     available:
	*                       type: number
	*                       description: The number of bytes the user can use
	*                       example: 1000000
	*                 seats:
	*                   type: object
	*                   properties:
	*                     used:
	*                       type: number
	*                       description: The number of collaborators the user is currently using
	*                       example: 1000000
	*                     available:
	*                       type: number
	*                       description: The number of collaborators the user can use
	*                       example: 1000000
	*
	*/
	router.get('/:teamspace/quota', isTeamspaceAdmin, getQuotaInfo);

	/**
	* @openapi
	* /teamspaces/{teamspace}/members/{username}:
	*   delete:
	*     description: Removes the user from the teamspace
	*     tags: [Teamspaces]
	*     parameters:
   	*       - name: teamspace
	*         description: name of teamspace
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*       - name: username
	*         description: the username of the user to be removed
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*     operationId: removeTeamspaceMember
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: Removes the user from the teamspace
	*
	*/
	router.delete('/:teamspace/members/:username', hasAccessToTeamspace, canRemoveTeamspaceMember, removeTeamspaceMember);

	/**
	* @openapi
	* /teamspaces/{teamspace}/members/{member}/avatar:
	*   get:
	*     description: Gets the avatar of a member of the teamspace
	*     tags: [Teamspaces]
	*     parameters:
   	*       - name: teamspace
	*         description: name of teamspace
	*         in: path
	*         required: true
	*         schema:
	*           type: string
   	*       - name: member
	*         description: username of teamspace member
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*     operationId: getTeamspaceMemberAvatar
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: Gets the avatar of a member of a teamspace
	*         content:
	*           image/png:
	*             schema:
	*               type: string
	*               format: binary
	*/
	router.get('/:teamspace/members/:member/avatar', hasAccessToTeamspace, memberExists, getTeamspaceMemberAvatar);

	/**
	* @openapi
	* /teamspaces/{teamspace}/addOns:
	*   get:
	*     description: Gets information about the addOns supported in a teamspace
	*     tags: [Teamspaces]
	*     parameters:
   	*       - name: teamspace
	*         description: name of teamspace
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*     operationId: getAddOns
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: Gets the addOns information of the teamspace
	*         content:
	*           application/json:
	*             schema:
	*               type: object
	*               properties:
	*                 vrEnabled:
	*                   type: boolean
	*                   description: Whether or not the vr addOn is supported in this teamspace
	*                   example: true
    *                 hereEnabled:
	*                   type: boolean
	*                   description: Whether or not the here addOn is supported in this teamspace
	*                   example: true
	*                 srcEnabled:
	*                   type: boolean
	*                   description: Whether or not the src addOn is supported in this teamspace
	*                   example: true
	*                 powerBIEnabled:
	*                   type: boolean
	*                   description: Whether or not the powerBI addOn is supported in this teamspace
	*                   example: true
	*                 modules:
	*                   type: array
	*                   description: A list of 3D repo modules supported in this teamspace
	*                   items:
	*                     type: string
	*                     description: The name of the module supported in this teamspace
	*                     example: issues
	*                   example: [issues, risks]
	*/
	router.get('/:teamspace/addOns', hasAccessToTeamspace, getAddOns);

	return router;
};

module.exports = establishRoutes();
