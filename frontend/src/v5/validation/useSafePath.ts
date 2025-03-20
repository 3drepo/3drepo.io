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
import { getErrorCode, isPathNotAuthorized, isProjectNotFound, isModelNotFound, isTeamspaceUnuthenticatedBySameUserOnDifferentSession } from '@/v5/validation/errors.helpers';
import { generatePath, useHistory } from 'react-router';
import { DASHBOARD_ROUTE, TEAMSPACE_ROUTE_BASE, PROJECT_ROUTE_BASE } from '@/v5/ui/routes/routes.constants';
import { ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { formatMessage } from '@/v5/services/intl';

export const useSafePath = (error) => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	const accessibleProjects = ProjectsHooksSelectors.selectProjects()[teamspace] || [];
	const hasAccessToProject = accessibleProjects.some(({ _id }) => _id === project);
	const history = useHistory();

	const code = getErrorCode(error);
	const modelNotFound = isModelNotFound(code);
	const projectNotFound = isProjectNotFound(code);
	const unauthorized = isPathNotAuthorized(error);
	const sessionIsValidButTeamspaceHasLostAuthentication = isTeamspaceUnuthenticatedBySameUserOnDifferentSession(error);

	const getPathName = () => {
		if ((modelNotFound || unauthorized) && hasAccessToProject) {
			return formatMessage({ id: 'alertModal.redirect.project', defaultMessage: 'the project page' });
		}
		if ((projectNotFound || unauthorized) && teamspace) {
			return formatMessage({ id: 'alertModal.redirect.teamspace', defaultMessage: 'the teamspace page' });
		}
		// teamspace not found
		return formatMessage({ id: 'alertModal.redirect.dashboard', defaultMessage: 'the dashboard' });
	};

	const getPath = () => {
		if (sessionIsValidButTeamspaceHasLostAuthentication) return generatePath(DASHBOARD_ROUTE);
		if ((modelNotFound || unauthorized) && hasAccessToProject) return generatePath(PROJECT_ROUTE_BASE, { teamspace, project });
		if ((projectNotFound || unauthorized) && teamspace) return generatePath(TEAMSPACE_ROUTE_BASE, { teamspace });
		// Teamspace not found
		return generatePath(DASHBOARD_ROUTE);
	};

	const redirect = () => {
		const path = getPath();
		history.push(path);
	};

	return [redirect, getPathName] as [() => void, () => string];
};
