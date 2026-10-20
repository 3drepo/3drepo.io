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

import { intersection, isArray, isEmpty } from 'lodash';
import { createSelector } from 'reselect';
import { Role } from '../../currentUser/currentUser.types';
import { selectTemplateById, selectTemplates } from '../tickets.selectors';
import { selectContainerRole } from '../../containers/containers.selectors';
import { selectFederationRole } from '../../federations/federations.selectors';
import { selectCurrentUser } from '../../currentUser/currentUser.selectors';
import { selectMyJob } from '@/v4/modules/jobs';
import { isCommenterRole } from '../../store.helpers';
import { ITemplate, ITicket } from '../tickets.types';
import { selectCurrentProjectTemplateById } from '../../projects/projects.selectors';

type TemplatePermissions = NonNullable<NonNullable<ITemplate['config']>['permissions']>;

const createTemplatePermissionSelector = (
	selectPermission: (permissions: TemplatePermissions) => string[] | undefined,
) => createSelector(
	selectContainerRole,
	selectFederationRole,
	selectCurrentUser,
	selectMyJob,
	// select template by model
	selectTemplateById,
	// select template by project
	(state, ...args) => selectCurrentProjectTemplateById(state, args.at(-1)),
	(contRole, fedRole, currentUser, myJob, modelTemplate, projectTemplate) => {
		const template = modelTemplate ?? projectTemplate;
		const modelRole = contRole || fedRole;
		if (modelRole === Role.ADMIN) return true;
		if (!isCommenterRole(modelRole)) return false;

		const permissionsList = selectPermission(template?.config?.permissions ?? {});

		return !isArray(permissionsList)
			|| !isEmpty(intersection(
				permissionsList,
				[currentUser.username, currentUser.email, myJob._id],
			));
	},
);

export const selectHasCreatePermissionForTemplate =
	createTemplatePermissionSelector((permissions) => permissions.create);

export const selectHasCommentPermissionForTemplate =
	createTemplatePermissionSelector((permissions) => permissions.comment);

export const selectHasDefaultEditPermissionForTemplate =
	createTemplatePermissionSelector((permissions) => permissions.edit?.default);

export const selectHasStatusEditPermissionForTemplate =
	createTemplatePermissionSelector((permissions) => permissions.edit?.status);

export const selectHasAssignPermissionForTemplate =
	createTemplatePermissionSelector((permissions) => permissions.edit?.assign);

export const selectCreatableTemplates = createSelector(
	(state) => state,
	(state, modelId) => modelId,
	selectTemplates,
	(state, modelId, templates) => templates.filter(
		({ _id, deprecated }) => selectHasCreatePermissionForTemplate(state, modelId, _id) && !deprecated),
);

export const selectIsTemplateEditable = createSelector(
	selectHasDefaultEditPermissionForTemplate,
	selectHasStatusEditPermissionForTemplate,
	selectHasAssignPermissionForTemplate,
	(canEditDefault, canEditStatus, canAssign) => canEditDefault || canEditStatus || canAssign,
);

export const selectEditableTicketIds = createSelector(
	(state) => state,
	(_, tickets: ITicket[]) => tickets,
	(state, tickets) => new Set(
		tickets
			.filter(({ modelId, type }) => selectIsTemplateEditable(state, modelId, type))
			.map(({ _id }) => _id),
	),
);
