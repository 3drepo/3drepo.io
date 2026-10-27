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

import {
	selectCreatableTemplates,
	selectEditableTicketIds,
	selectHasAssignPermissionForTemplate,
	selectHasCommentPermissionForTemplate,
	selectHasCreatePermissionForTemplate,
	selectHasDefaultEditPermissionForTemplate,
	selectHasStatusEditPermissionForTemplate,
	selectTemplateCanBeCreatedOnModels,
} from '@/v5/store/tickets/templatesPermissions/templatesPermissions.selectors';
import { Role } from '@/v5/store/currentUser/currentUser.types';
import { ITemplate } from '@/v5/store/tickets/tickets.types';
import { templateMockFactory, ticketMockFactory } from './tickets.fixture';

jest.mock('@/v5/store/tickets/tickets.selectors', () => ({
	selectTemplateById: (state, _modelId, templateId) => (
		state.templates.find(({ _id }) => _id === templateId) || null
	),
	selectTemplates: (state) => state.templates,
}));
jest.mock('@/v5/store/projects/projects.selectors', () => ({
	selectCurrentProjectTemplateById: (state, templateId) => (
		state.projectTemplates?.find(({ _id }) => _id === templateId)
	),
}));
jest.mock('@/v5/store/containers/containers.selectors', () => ({
	selectContainerRole: (state, modelId) => state.rolesByModel?.[modelId] ?? state.role,
}));
jest.mock('@/v5/store/federations/federations.selectors', () => ({
	selectFederationRole: () => undefined,
}));
jest.mock('@/v5/store/currentUser/currentUser.selectors', () => ({
	selectCurrentUser: (state) => state.user,
}));
jest.mock('@/v4/modules/jobs', () => ({
	selectMyJob: (state) => state.job,
}));

const user = { username: 'myUsername', email: 'my@email.com' };
const makePermissionState = (
	template: ITemplate,
	role = Role.COMMENTER,
	templates = [template],
	currentUser = user,
	job = { _id: 'job' },
) => ({ templates, role, user: currentUser, job });

describe('Template edit permissions', () => {
	const ticket = ticketMockFactory({ modelId: 'model', type: 'template' });
	const denied = { default: [], status: [], assign: [] };

	const editableIds = (
		edit: NonNullable<NonNullable<ITemplate['config']>['permissions']>['edit'],
		role = Role.COMMENTER,
	) => selectEditableTicketIds(makePermissionState(
		templateMockFactory({ _id: ticket.type, config: { permissions: { edit } } }),
		role,
		undefined,
		{ username: 'user', email: 'user@example.com' },
	), [ticket]);

	it.each(['default', 'status', 'assign'])('allows editing with only %s permission', (permission) => {
		expect(editableIds({ ...denied, [permission]: ['user'] })).toEqual(new Set([ticket._id]));
	});

	it('denies editing when all three permissions are denied', () => {
		expect(editableIds(denied)).toEqual(new Set());
	});

	it('uses model access when edit permissions are unspecified', () => {
		expect(editableIds(undefined)).toEqual(new Set([ticket._id]));
	});

	it('allows admins even when all edit permissions are denied', () => {
		expect(editableIds(denied, Role.ADMIN)).toEqual(new Set([ticket._id]));
	});

	it('denies viewers even with explicit edit permission', () => {
		expect(editableIds({ ...denied, default: ['user'] }, Role.VIEWER)).toEqual(new Set());
	});
});

describe('Template permissions', () => {
	const modelId = 'modelId';
	const templateId = 'templateId';
	const template = templateMockFactory({
		_id: templateId,
		config: {
			permissions: {
				create: [user.email],
				comment: ['job'],
				edit: {
					assign: ['otherUsername'],
					default: [user.username],
				},
			},
		},
	});

	it('denies viewers even when they are listed in the template permissions', () => {
		const state = makePermissionState(template, Role.VIEWER);
		expect(selectHasDefaultEditPermissionForTemplate(state, modelId, templateId)).toBe(false);
	});

	it('allows admins even when they are not listed in the template permissions', () => {
		const state = makePermissionState(template, Role.ADMIN);
		expect(selectHasAssignPermissionForTemplate(state, modelId, templateId)).toBe(true);
	});

	it('uses template-level edit permissions for commenters', () => {
		const state = makePermissionState(template);
		expect(selectHasAssignPermissionForTemplate(state, modelId, templateId)).toBe(false);
		expect(selectHasDefaultEditPermissionForTemplate(state, modelId, templateId)).toBe(true);
	});

	it('falls back to model access when template-level permissions are unspecified', () => {
		const templateWithoutPermissions = templateMockFactory({ _id: templateId });
		const state = makePermissionState(templateWithoutPermissions);
		expect(selectHasStatusEditPermissionForTemplate(state, modelId, templateId)).toBe(true);
	});

	it('applies create permissions based on the current user email', () => {
		const state = makePermissionState(template);
		expect(selectHasCreatePermissionForTemplate(state, modelId, templateId)).toBe(true);

		const stateWithChangedEmail = makePermissionState(template, Role.COMMENTER, [template], {
			...user,
			email: 'newEmail@example.com',
		});
		expect(selectHasCreatePermissionForTemplate(stateWithChangedEmail, modelId, templateId)).toBe(false);
	});

	it('applies comment permissions based on the current job', () => {
		const state = makePermissionState(template);
		expect(selectHasCommentPermissionForTemplate(state, modelId, templateId)).toBe(true);

		const stateWithChangedJob = makePermissionState(template, Role.COMMENTER, [template], user, { _id: 'New Job' });
		expect(selectHasCommentPermissionForTemplate(stateWithChangedJob, modelId, templateId)).toBe(false);
	});

	it('uses project template permissions when the model template is unavailable', () => {
		const state = {
			...makePermissionState(template, Role.COMMENTER, []),
			projectTemplates: [template],
		};

		expect(selectHasCreatePermissionForTemplate(state, modelId, templateId)).toBe(true);
		expect(selectHasAssignPermissionForTemplate(state, modelId, templateId)).toBe(false);
	});

	it('prefers model template permissions over project template permissions', () => {
		const projectTemplate = templateMockFactory({
			_id: templateId,
			config: { permissions: { create: [] } },
		});
		const state = {
			...makePermissionState(template),
			projectTemplates: [projectTemplate],
		};

		expect(selectHasCreatePermissionForTemplate(state, modelId, templateId)).toBe(true);
	});

	it('lists only templates for which the user has create permission', () => {
		const templateWithoutPermission = templateMockFactory({
			config: { permissions: { create: ['someOtherUser'] } },
		});
		const templateWithPermission = templateMockFactory({
			config: { permissions: { create: [user.username] } },
		});
		const templates = [templateWithPermission, templateWithoutPermission];
		const state = makePermissionState(templateWithPermission, Role.COMMENTER, templates);

		const creatableTemplates = selectCreatableTemplates(state, modelId);
		const creatableTemplateIds = creatableTemplates.map(({ _id }) => _id);

		expect(creatableTemplateIds).not.toContain(templateWithoutPermission._id);
		expect(creatableTemplateIds).toContain(templateWithPermission._id);
	});

	it('excludes deprecated templates even when create permission is granted', () => {
		const deprecatedTemplate = templateMockFactory({
			deprecated: true,
			config: { permissions: { create: [user.username] } },
		});
		const state = makePermissionState(deprecatedTemplate);

		expect(selectCreatableTemplates(state, modelId)).toEqual([]);
	});

	it('allows creation when at least one model grants permission', () => {
		const state = {
			...makePermissionState(template, Role.VIEWER, []),
			projectTemplates: [template],
			rolesByModel: { viewerModel: Role.VIEWER, commenterModel: Role.COMMENTER },
		};

		expect(selectTemplateCanBeCreatedOnModels(state, ['viewerModel', 'commenterModel'], templateId)).toBe(true);
		expect(selectTemplateCanBeCreatedOnModels(state, ['viewerModel'], templateId)).toBe(false);
		expect(selectTemplateCanBeCreatedOnModels(state, [], templateId)).toBe(false);
	});
});
