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
const UserRoutes  = require('./users');
const ContainerGroupsRoutes = require('./teamspaces/projects/containers/groups');
const ContainerRevisionRoutes = require('./teamspaces/projects/containers/revisions');
const ContainerRoutes = require('./teamspaces/projects/containers/containers');
const FederationGroupsRoutes = require('./teamspaces/projects/federations/groups');
const FederationRoutes = require('./teamspaces/projects/federations/federations');
const ProjectRoutes = require('./teamspaces/projects/projects');
const TeamspaceRoutes = require('./teamspaces/teamspaces');

RoutesManager.init = (app) => {
	// Auth
	app.use('/v5/', UserRoutes);

	app.use('/v5/teamspaces/', TeamspaceRoutes);
	app.use('/v5/teamspaces/:teamspace/projects', ProjectRoutes);

	// Containers
	app.use('/v5/teamspaces/:teamspace/projects/:project/containers', ContainerRoutes);
	app.use('/v5/teamspaces/:teamspace/projects/:project/containers/:container/groups', ContainerGroupsRoutes);
	app.use('/v5/teamspaces/:teamspace/projects/:project/containers/:container/revisions', ContainerRevisionRoutes);

	// Federations
	app.use('/v5/teamspaces/:teamspace/projects/:project/federations', FederationRoutes);
	app.use('/v5/teamspaces/:teamspace/projects/:project/federations/:federation/groups', FederationGroupsRoutes);
};

module.exports = RoutesManager;
