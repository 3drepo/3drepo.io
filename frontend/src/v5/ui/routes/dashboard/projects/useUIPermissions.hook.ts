/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { formatMessage } from '@/v5/services/intl';
import { ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { isEmpty } from 'lodash';

const REDIRECT_TO_PROJECT_ERROR = {
	code: 'ERR_BAD_REQUEST',
	response: { status: 401 },
	message: formatMessage({ id: 'projectContent.error.message', defaultMessage: 'Permissions disabled' }),
} as any;

export const useUIPermissions = () => {
	const isFetchingAddons = TeamspacesHooksSelectors.selectIsFetchingAddons();
	const isFetchingProject = isEmpty(ProjectsHooksSelectors.selectCurrentProjectDetails());
	const hasPermissions = TeamspacesHooksSelectors.selectPermissionsOnUIDisabled();

	const openRedirectModal = () => DialogsActionsDispatchers.open('alert', {
		currentActions: formatMessage({ id: 'projectContent.permissions.action', defaultMessage: 'trying to access teamspace permissions' }),
		error: REDIRECT_TO_PROJECT_ERROR,
	});

	return {
		isLoading: isFetchingAddons || isFetchingProject,
		hasPermissions,
		openRedirectModal,
	};
};
