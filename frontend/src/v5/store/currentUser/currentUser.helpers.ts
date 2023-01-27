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

import { clientConfigService } from '@/v4/services/clientConfig';
import { ContainersHooksSelectors, FederationsHooksSelectors, ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { Roles } from './currentUser.types';

export const avatarFileIsTooBig = (file): boolean => (file.size > clientConfigService.avatarSizeLimit);

const getContainerOrFederationRole = (containerOrFederationId: string): Roles => {
	const selectedContainer = ContainersHooksSelectors.selectContainerById(containerOrFederationId);
	const selectedFederation = FederationsHooksSelectors.selectFederationById(containerOrFederationId);

	if (selectedFederation) return FederationsHooksSelectors.selectFederationById(containerOrFederationId)?.role;
	if (selectedContainer) return ContainersHooksSelectors.selectContainerById(containerOrFederationId)?.role;
	return Roles.NONE;
};

export const hasTeamspaceAdminAccess = () => TeamspacesHooksSelectors.selectCurrentTeamspaceDetails()?.isAdmin;

export const hasProjectAdminAccess = () => ProjectsHooksSelectors.selectCurrentProjectDetails()?.isAdmin;

export const hasCollaboratorAccess = (containerOrFederationId: string) => {
	const role = getContainerOrFederationRole(containerOrFederationId);
	return [Roles.ADMIN, Roles.COLLABORATOR].includes(role);
};

export const hasCommenterAccess = (containerOrFederationId: string) => {
	const role = getContainerOrFederationRole(containerOrFederationId);
	return [Roles.ADMIN, Roles.COLLABORATOR, Roles.COMMENTER].includes(role);
};
