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

const { hasReadAccessToContainer, hasWriteAccessToContainer } = require('../../../../../middleware/permissions');
const Metadata = require('../../../../../processors/teamspaces/projects/models/commons/metadata');
const { Router } = require('express');
const { formatMetadata } = require('../../../../../middleware/dataConverter/outputs/common/metadata');
const { getAllMetadata: getContainerMetadata } = require('../../../../../processors/teamspaces/projects/models/commons/metadata');
const { modelTypes } = require('../../../../../models/modelSettings.constants');
const { respond } = require('../../../../../utils/responder');
const { templates } = require('../../../../../utils/responseCodes');
const { validateUpdateCustomMetadata } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/metadata');
const { verifyRevQueryParam } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/revisions');

const updateCustomMetadata = async (req, res) => {
	const { teamspace, container, metadata } = req.params;
	const updatedMetadata = req.body.metadata;

	try {
		await Metadata.updateCustomMetadata(teamspace, container, metadata, updatedMetadata);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getAllMetadata = async (req, res, next) => {
	const { teamspace, container, revision } = req.params;

	try {
		req.metadata = await getContainerMetadata(teamspace, container, revision);
		await next();
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const establishRoutes = (isInternal) => {
	const router = Router({ mergeParams: true });

	if (isInternal) {
		/**
		* @openapi
		* /teamspaces/{teamspace}/projects/{project}/containers/{container}/metadata:
		*   get:
		*     description: Returns all metadata entries within the revision. Optionally accepts a revision ID (`revId`). If `revId` is not provided, the latest revision is returned.
		*     tags: [v:internal, Metadata]
		*     operationId: getAllMetadata
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
		*       - name: revId
		*         description: Revision ID
		*         in: query
		*         required: false
		*         schema:
		*           type: string
		*           format: uuid
		*     responses:
		*       401:
		*         $ref: "#/components/responses/notLoggedIn"
		*       200:
		*         description: returns all metadata entries within the revision
		*         content:
		*           application/json:
		*             example:
		*               "data": [
		*                  {
		*                     "_id": "2f461edf-4544-412a-bb84-ffdb3bbe563b",
		*                     "metadata": {
		*                        "IFC Type": "IfcBuilding",
		*                        "IFC GUID": "00tMo7QcxqWdIGvc4sMN2A",
		*                        "BuildingID": "n/a",
		*                        "IsPermanentID": "True",
		*                        "OccupancyType": "Private dwelling",
		*                        "IsLandmarked": "True",
		*                        "NumberOfStoreys": 2
		*                     },
		*                     "parents": [
		*                        "9eeddbe2-750d-46fb-988f-bcf9ec2ecf51"
		*                     ]
		*                  },
		*                  {
		*                     "_id": "85ad29bd-cd99-4472-a92f-86266b07e57d",
		*                     "metadata": {
		*                        "IFC Type": "IfcSite",
		*                        "IFC GUID": "20FpTZCqJy2vhVJYtjuIce"
		*                     },
		*                     "parents": [
		*                        "48359ad0-9b6d-44ed-ae93-47e2ec69ea88"
		*                     ]
		*                  },
		*                  {
		*                     "_id": "b5fe5dcf-ce8c-4b1e-a96b-bdc5aa001963",
		*                     "metadata": {
		*                        "IFC Type": "IfcBuildingElementProxy",
		*                        "IFC GUID": "3VkTAO0fr0XQHS3DxQzfxm",
		*                        "Reference": "LegoRoundTree"
		*                     },
		*                     "parents": [
		*                        "2bf2a864-5cb0-41ba-85a8-c2cffc3da06d"
		*                     ]
		*                  },
		*                  {
		*                     "_id": "c4682cf2-7b2a-41c7-8fe2-c0c39512dd99",
		*                     "metadata": {
		*                        "IFC Type": "IfcBuildingStorey",
		*                        "IFC GUID": "1oZ0wPs_PE8ANCPg3bIs4j",
		*                        "AboveGround": "False"
		*                     },
		*                     "parents": [
		*                        "323a9900-ece1-4857-8980-ec96ffc7f681"
		*                     ]
		*                  }
		*               ]
		*/
		router.get('/', hasReadAccessToContainer, verifyRevQueryParam(modelTypes.CONTAINER), getAllMetadata, formatMetadata);
	} else {
		/**
		 * @openapi
		 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/metadata/{metadata}:
		 *   patch:
		 *     description: Adds, removes or edits custom metadata of an element of a 3D model. If a metadata does not exist it is added and if it exists it is updated. To remove a metadata provide null value.
		 *     tags: [v:external, Metadata]
		 *     operationId: updateCustomMetadata
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
		 *       - name: metadata
		 *         description: Metadata ID
		 *         in: path
		 *         required: true
		 *         schema:
		 *           type: string
		 *           format: uuid
		 *     requestBody:
		 *       content:
		 *         application/json:
		 *           schema:
		 *             properties:
		 *               metadata:
		 *                 description: The metadata to be added, removed or updated
		 *                 type: array
		 *                 items:
		 *                   type: object
		 *                   properties:
		 *                     key:
		 *                       description: The key of the metadata
		 *                       type: string
		 *                       maxLength: 120
		 *                       example: Length (mm)
		 *                     value:
		 *                       description: The value of the metadata
		 *                       oneOf:
		 *                         - type: string
		 *                           maxLength: 120
		 *                         - type: number
		 *                         - type: boolean
		 *                       example: 100
		 *     responses:
		 *       401:
		 *         $ref: "#/components/responses/notLoggedIn"
		 *       200:
		 *         description: Adds, removes or edits metadata of an element of a 3D model
		 */
		router.patch('/:metadata', hasWriteAccessToContainer, validateUpdateCustomMetadata, updateCustomMetadata);
	}

	return router;
};

module.exports = establishRoutes;
