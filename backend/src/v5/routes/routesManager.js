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
const ContainerRoutes = require('./teamspaces/projects/containers/containers');
const ContainerStatsRoutes = require('./teamspaces/projects/containers/stats');
const ProjectRoutes = require('./teamspaces/projects/projects');
const TeamspaceRoutes = require('./teamspaces/teamspaces');

RoutesManager.init = (app) => {
	app.use('/v5/teamspaces/', TeamspaceRoutes);
	app.use('/v5/teamspaces/:teamspace/projects', ProjectRoutes);
	app.use('/v5/teamspaces/:teamspace/projects/:project/containers', ContainerRoutes);
	app.use('/v5/teamspaces/:teamspace/projects/:project/containers', ContainerStatsRoutes);
};

module.exports = RoutesManager;
