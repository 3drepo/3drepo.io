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

const RoutesManager = {};
const AadRoutes = require('./sso/aad');
const BundleMappingsRoutes = require('./teamspaces/projects/models/containers/bundleMappings');
const BundleRoutes = require('./teamspaces/projects/models/containers/bundles');
const CalibrationRoutes = require('./teamspaces/projects/models/drawings/calibrations');
const CreateAssetMapRoutes = require('./teamspaces/projects/models/common/assetMaps');
const CreateAssetMetaRoutes = require('./teamspaces/projects/models/common/metadata');
const CreateGeneralRevisionRoutes = require('./teamspaces/projects/models/common/revisions');
const CreateGroupRoutes = require('./teamspaces/projects/models/common/groups');
const CreateModelGeneralRoutes = require('./teamspaces/projects/models/common/general');
const CreateModelPropertiesRoutes = require('./teamspaces/projects/models/common/modelProperties');
const CreateRepoAssetRoutes = require('./teamspaces/projects/models/common/repoAssets');
const CreateTicketCommentsRoutes = require('./teamspaces/projects/models/common/tickets.comments');
const CreateTicketGroupsRoutes = require('./teamspaces/projects/models/common/tickets.groups');
const CreateTicketRoutes = require('./teamspaces/projects/models/common/tickets');
const CreateViewRoutes = require('./teamspaces/projects/models/common/views');
const FederationRevisionRoutes = require('./teamspaces/projects/models/federations/revisions');
const MeshRoutes = require('./teamspaces/projects/models/containers/meshes');
const MetadataRoutes = require('./teamspaces/projects/models/containers/metadata');
const ProjectRoutes = require('./teamspaces/projects/projects');
const SsoRoutes = require('./sso');
const TeamspaceJobRoutes = require('./teamspaces/jobs');
const TeamspaceRoutes = require('./teamspaces/teamspaces');
const TeamspaceSettingsRoutes = require('./teamspaces/settings');
const TextureRoutes = require('./teamspaces/projects/models/containers/textures');
const UserRoutes = require('./users');
const { modelTypes } = require('../models/modelSettings.constants');

RoutesManager.init = (app) => {
	// Auth
	app.use('/v5/', UserRoutes);

	// Single Sign On
	app.use('/v5/sso', SsoRoutes);
	app.use('/v5/sso/aad', AadRoutes);

	app.use('/v5/teamspaces/', TeamspaceRoutes);
	app.use('/v5/teamspaces/:teamspace/settings', TeamspaceSettingsRoutes);
	app.use('/v5/teamspaces/:teamspace/jobs', TeamspaceJobRoutes);
	app.use('/v5/teamspaces/:teamspace/projects', ProjectRoutes);

	// Containers
	app.use('/v5/teamspaces/:teamspace/projects/:project/containers', CreateModelGeneralRoutes(modelTypes.CONTAINER));
	app.use('/v5/teamspaces/:teamspace/projects/:project/containers/:model/tickets', CreateTicketRoutes());
	app.use('/v5/teamspaces/:teamspace/projects/:project/containers/:model/tickets/:ticket/comments', CreateTicketCommentsRoutes());
	app.use('/v5/teamspaces/:teamspace/projects/:project/containers/:model/tickets/:ticket/groups', CreateTicketGroupsRoutes());
	app.use('/v5/teamspaces/:teamspace/projects/:project/containers/:model/groups', CreateGroupRoutes());
	app.use('/v5/teamspaces/:teamspace/projects/:project/containers/:model/views', CreateViewRoutes());
	app.use('/v5/teamspaces/:teamspace/projects/:project/containers/:model/revisions', CreateGeneralRevisionRoutes(modelTypes.CONTAINER));
	app.use('/v5/teamspaces/:teamspace/projects/:project/containers/:container/metadata', MetadataRoutes);
	app.use('/v5/teamspaces/:teamspace/projects/:project/containers/:container/bundleMappings', BundleMappingsRoutes);
	app.use('/v5/teamspaces/:teamspace/projects/:project/containers/:container/bundles', BundleRoutes);
	app.use('/v5/teamspaces/:teamspace/projects/:project/containers/:container/textures', TextureRoutes);
	app.use('/v5/teamspaces/:teamspace/projects/:project/containers/:container/meshes', MeshRoutes);
	app.use('/v5/teamspaces/:teamspace/projects/:project/containers/:model/assetsMeta', CreateAssetMetaRoutes(modelTypes.CONTAINER));
	app.use('/v5/teamspaces/:teamspace/projects/:project/containers/:model/assetMaps', CreateAssetMapRoutes(modelTypes.CONTAINER));
	app.use('/v5/teamspaces/:teamspace/projects/:project/containers/:model/assets/properties', CreateModelPropertiesRoutes(modelTypes.CONTAINER));
	app.use('/v5/teamspaces/:teamspace/projects/:project/containers/:model/assets/repobundles', CreateRepoAssetRoutes(modelTypes.CONTAINER));

	// Federations
	app.use('/v5/teamspaces/:teamspace/projects/:project/federations', CreateModelGeneralRoutes(modelTypes.FEDERATION));
	app.use('/v5/teamspaces/:teamspace/projects/:project/federations/:model/tickets', CreateTicketRoutes(true));
	app.use('/v5/teamspaces/:teamspace/projects/:project/federations/:model/tickets/:ticket/comments', CreateTicketCommentsRoutes(true));
	app.use('/v5/teamspaces/:teamspace/projects/:project/federations/:model/tickets/:ticket/groups', CreateTicketGroupsRoutes(true));
	app.use('/v5/teamspaces/:teamspace/projects/:project/federations/:model/groups', CreateGroupRoutes(true));
	app.use('/v5/teamspaces/:teamspace/projects/:project/federations/:model/views', CreateViewRoutes(true));
	app.use('/v5/teamspaces/:teamspace/projects/:project/federations/:federation/revisions', FederationRevisionRoutes);
	app.use('/v5/teamspaces/:teamspace/projects/:project/federations/:model/assetsMeta', CreateAssetMetaRoutes(modelTypes.FEDERATION));
	app.use('/v5/teamspaces/:teamspace/projects/:project/federations/:model/assetMaps', CreateAssetMapRoutes(modelTypes.FEDERATION));
	app.use('/v5/teamspaces/:teamspace/projects/:project/federations/:model/assets/properties', CreateModelPropertiesRoutes(modelTypes.FEDERATION));
	app.use('/v5/teamspaces/:teamspace/projects/:project/federations/:model/assets/repobundles', CreateRepoAssetRoutes(modelTypes.FEDERATION));

	// Drawings
	app.use('/v5/teamspaces/:teamspace/projects/:project/drawings', CreateModelGeneralRoutes(modelTypes.DRAWING));
	app.use('/v5/teamspaces/:teamspace/projects/:project/drawings/:model/revisions', CreateGeneralRevisionRoutes(modelTypes.DRAWING));
	app.use('/v5/teamspaces/:teamspace/projects/:project/drawings/:drawing/revisions/:revision/calibrations', CalibrationRoutes);
};

module.exports = RoutesManager;
