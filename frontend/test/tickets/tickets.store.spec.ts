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

import { TeamspacesActions } from '@/v5/store/teamspaces/teamspaces.redux';
import { TicketsActions, TicketsTypes } from '@/v5/store/tickets/tickets.redux';
import { selectTickets, selectTemplates, selectTicketById, selectTemplateById, selectRiskCategories, selectHasPermissionForTemplate, selectCreatableTemplates } from '@/v5/store/tickets/tickets.selectors';
import { cloneDeep } from 'lodash';
import { createTestStore } from '../test.helpers';
import { mockRiskCategories, templateMockFactory, ticketMockFactory } from './tickets.fixture';
import { mockServer } from '../../internals/testing/mockServer';
import { JobsActions } from '@/v4/modules/jobs/jobs.redux';
import { CurrentUserActions } from '@/v5/store/currentUser/currentUser.redux';
import { containerMockFactory } from '../containers/containers.fixtures';
import { Role } from '@/v5/store/currentUser/currentUser.types';
import { ContainersActions } from '@/v5/store/containers/containers.redux';
import { IContainer, NewContainer } from '@/v5/store/containers/containers.types';
import { currentUserMockFactory } from '../currentUser/currentUser.fixtures';
import { ProjectsActions } from '@/v5/store/projects/projects.redux';

describe('Tickets: store', () => {
	let dispatch, getState, waitForActions;
	const teamspace = 'teamspace';
	const modelId = 'modelId';
	const projectId = 'projectId';

	beforeEach(() => {
		({ dispatch, getState, waitForActions } = createTestStore());
	});

	describe('tickets', () => {
		it('should fetch and set model tickets', () => {
			const ticket = ticketMockFactory({ modelId });
			dispatch(TicketsActions.fetchTicketsSuccess(modelId, [ticket]));
			const modelTicketsFromState = selectTickets(getState(), modelId);
	
			expect(modelTicketsFromState[0]).toEqual(ticket);
		});
	
		it('should update the model tickets', () => {
			const ticket = ticketMockFactory({ modelId });
			dispatch(TicketsActions.fetchTicketsSuccess(modelId, [ticket]));
	
			const oldTicket = cloneDeep(ticket)
			const modifications = { _id: ticket._id, title:'modified ticket', properties:{priority:'Top'}}
				
			dispatch(TicketsActions.upsertTicketSuccess(modelId, modifications));
			
			const modified = {...oldTicket,  ...modifications, properties:{...oldTicket.properties, priority:'Top' } };
			const ticketFromStore = selectTicketById(getState(), modelId, ticket._id);
	
			expect(ticketFromStore).toEqual(modified);
		});
	
		it('should update many tickets', async () => {
			const tickets =  [];
			const ticketsCount = 100;
			const templateId = 'templateId'
			const ticketsHalf = Math.round(ticketsCount/2);
	
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets?template=${templateId}`)
				.reply(200);
	


			for (let i=0 ; i < ticketsCount; i++) {
				const ticket = ticketMockFactory({modelId, type: templateId});
				ticket.properties.priority = 'Low';
				tickets.push(ticket);
			}

			dispatch(TicketsActions.fetchTicketsSuccess(modelId, tickets));
	
			const ids = tickets.slice(0, ticketsHalf).map(t=> t._id);

			const modifications = { title:'modified ticket', properties:{priority:'Top'}}

			await waitForActions(() => {
				dispatch(TicketsActions.updateManyTickets(teamspace, projectId, ids, modifications));
			}, [
				TicketsTypes.UPSERT_TICKETS_SUCCESS,
			]);
			
			for (let i = 0; i < ticketsHalf ;i ++) {
				const ticket = tickets[i];
				const ticketFromStore = selectTicketById(getState(), modelId, ticket._id);
				delete ticketFromStore.properties['Updated at'];
				const modified = {...ticket,  ...modifications, properties:{...ticket.properties, priority:'Top' } };
				// All the tickets from the first half should have been modified			
				expect(ticketFromStore).toEqual(modified);
			}

			for (let i = ticketsHalf; i < ticketsCount ;i ++) {
				const ticket = tickets[i];
				const ticketFromStore = selectTicketById(getState(), modelId, ticket._id);
				// All the tickets from the second half should have stayed the same			
				expect(ticketFromStore).toEqual(ticket);
			}
		});

		it('should insert a ticket', () => {
			const ticket = ticketMockFactory({ modelId });
			dispatch(TicketsActions.upsertTicketSuccess(modelId, ticket));
			const ticketFromStore = selectTicketById(getState(), modelId, ticket._id);
			expect(ticketFromStore).toEqual(ticket);
		});
	});

	describe('templates', () => {
		beforeEach(() => {
			dispatch(TeamspacesActions.setCurrentTeamspace(teamspace));
		});

		it('should fetch and set model templates', () => {
			const template = templateMockFactory();
			dispatch(TicketsActions.fetchTemplatesSuccess(modelId, [template]));
			const templatesFromState = selectTemplates(getState(), modelId);
	
			expect(templatesFromState[0]).toEqual(template);
		});


		it('should replace the template', () => {
			const template = templateMockFactory();
			dispatch(TicketsActions.fetchTemplatesSuccess(modelId, [template]));
	
			const newTemplate = templateMockFactory();
			newTemplate._id = template._id;

			dispatch(TicketsActions.replaceTemplateSuccess(modelId, newTemplate));
			
			const ticketFromStore = selectTemplateById(getState(), modelId, template._id);

			expect(ticketFromStore).toEqual(newTemplate);
		});

		it('should remove hidden fields from fetched templates', () => {
			const templateWithHiddenProperties = templateMockFactory({
				properties: [
					{ name: 'Prop1', type: 'text' },
					{ name: 'Hidden prop', type: 'text', hiddenOnUI: true },
				],
				modules: [
					{
						name: 'a module',
						properties: [
							{ name: 'Modules Prop', type: 'text' },
							{ name: 'Hidden module prop', type: 'text', hiddenOnUI: true },
						],
					},
					{
						name: 'hidden module',
						properties: [
							{ name: 'Only hidden prop', type: 'text', hiddenOnUI: true },
						],
					},
				],
			});
			const templateWithoutHiddenProperties = {
				...templateWithHiddenProperties,
				properties: [
					{ name: 'Prop1', type: 'text' },
				],
				modules: [
					{
						name: 'a module',
						properties: [
							{ name: 'Modules Prop', type: 'text' },
						],
					},
				],
			};

			dispatch(TicketsActions.fetchTemplatesSuccess(modelId, [templateWithHiddenProperties]));
			const templatesFromState = selectTemplates(getState(), modelId);

			expect(templatesFromState[0]).toEqual(templateWithoutHiddenProperties);
		});

		it('should remove hidden fields when replacing a template', () => {
			const template = templateMockFactory();
			const replacementTemplateWithHiddenProperties = templateMockFactory({
				_id: template._id,
				properties: [
					{ name: 'Prop1', type: 'text' },
					{ name: 'Hidden prop', type: 'text', hiddenOnUI: true },
				],
				modules: [
					{
						name: 'a module',
						properties: [
							{ name: 'Modules Prop', type: 'text' },
							{ name: 'Hidden module prop', type: 'text', hiddenOnUI: true },
						],
					},
				],
			});
			const replacementTemplateWithoutHiddenProperties = {
				...replacementTemplateWithHiddenProperties,
				properties: [
					{ name: 'Prop1', type: 'text' },
				],
				modules: [
					{
						name: 'a module',
						properties: [
							{ name: 'Modules Prop', type: 'text' },
						],
					},
				],
			};

			dispatch(TicketsActions.fetchTemplatesSuccess(modelId, [template]));
			dispatch(TicketsActions.replaceTemplateSuccess(modelId, replacementTemplateWithHiddenProperties));
			const templateFromStore = selectTemplateById(getState(), modelId, template._id);

			expect(templateFromStore).toEqual(replacementTemplateWithoutHiddenProperties);
		});

		it('deprecated fields shouldnt be there', () => {
			const templateWithDeprecated = templateMockFactory({ 
				properties: [
					{
						name:'Prop1',
						type:'text',
					},
					{
						name:'Deprecated prop',
						type:'boolean',
						deprecated: true,
					}
				],
				modules: [
					{ 
						name: 'a module',
						properties: [
							{
								name:'A deprecated module prop',
								type:'text',
								deprecated: true,
							},
							{
								name:'Modules Prop',
								type:'text',
							},
							{
								name:'Another deprecated prop',
								type:'boolean',
								deprecated: true,
							}
						],
					},
					{ 
						name: 'a deprecated module',
						deprecated: true,
						properties: [
							{
								name:'A deprecated Modules Prop',
								type:'text',
							}
						],
					},

				]
			});
			

			const templateWithoutDeprecated = {
				...templateWithDeprecated,
				properties: [
					{
						name:'Prop1',
						type:'text',
					}
				],
				modules: [
					{ 
						name: 'a module',
						properties: [
							{
								name:'Modules Prop',
								type:'text',
							}
						],
					},
				]
			};

			dispatch(TicketsActions.fetchTemplatesSuccess(modelId, [templateWithDeprecated]));
			const templatesFromState = selectTemplates(getState(), modelId);
	
			expect(templatesFromState[0]).toEqual(templateWithoutDeprecated);	
		});

		describe('permissions', () => {
			const templateId = 'templateId';
			const user = currentUserMockFactory({ username: 'myUsername', email: 'my@email.com' });
			const job = 'Good Job';
			const mockContainer = containerMockFactory({ _id: modelId, role: Role.COMMENTER });
			const template = templateMockFactory({ _id: templateId, config: { permissions: {
					create: [ user.email ],
					comment: [ job ],
					edit: {
						assign: [ 'otherUsername' ],
						// status is intentionally not included 
						default: [ user.username ],
					}}}});

			beforeEach(() => {
				dispatch(ProjectsActions.setCurrentProject(projectId));
				dispatch(CurrentUserActions.fetchUserSuccess(user))
				dispatch(JobsActions.getMyJobSuccess(job));
				dispatch(TicketsActions.fetchTemplatesSuccess(modelId, [template]));
				dispatch(ContainersActions.fetchContainersSuccess(projectId, [mockContainer]))
			});
			
			it('should not allow viewers permission to a template - even if they are listed in the template permissions', () => {
				const mockContainer = containerMockFactory({ _id: modelId, role: Role.VIEWER });
				dispatch(ContainersActions.fetchContainersSuccess(projectId, [mockContainer]))
				
				const hasPermissions = selectHasPermissionForTemplate(getState(), modelId, templateId, 'edit.default')
				expect(hasPermissions).toBe(false);
			});
			it('should always allow admins permission to a template - even if they are not in the template permissions', () => {
				const mockContainer = containerMockFactory({ _id: modelId, role: Role.ADMIN });
				dispatch(ContainersActions.fetchContainersSuccess(projectId, [mockContainer]))
				
				const hasPermissions = selectHasPermissionForTemplate(getState(), modelId, templateId, 'edit.assign')
				expect(hasPermissions).toBe(true);
			});
			it('should use template level permissions for commenters/collaborators', () => {
				const hasAssignPermissions = selectHasPermissionForTemplate(getState(), modelId, templateId, 'edit.assign')
				const hasDefaultPermissions = selectHasPermissionForTemplate(getState(), modelId, templateId, 'edit.default')
				expect(hasAssignPermissions).toBe(false);
				expect(hasDefaultPermissions).toBe(true);
			});
			it('should use model level permissions if template level permissions are not defined', () => {
				const hasStatusPermissions = selectHasPermissionForTemplate(getState(), modelId, templateId, 'edit.status')
				expect(hasStatusPermissions).toBe(true);
			});
			it('should apply permissions based on emails', () => {
				const hasPermissions = selectHasPermissionForTemplate(getState(), modelId, templateId, 'create')
				expect(hasPermissions).toBe(true);
				dispatch(CurrentUserActions.updateUserSuccess({ email: 'newEmail@example.com' }))
				const hasPermissionsAfterEmailChange = selectHasPermissionForTemplate(getState(), modelId, templateId, 'create')
				expect(hasPermissionsAfterEmailChange).toBe(false);
			});
			it('should apply permissions based on jobs', () => {
				const hasPermissions = selectHasPermissionForTemplate(getState(), modelId, templateId, 'comment')
				expect(hasPermissions).toBe(true);
				dispatch(JobsActions.getMyJobSuccess('New Job'))
				const hasPermissionsAfterJobChange = selectHasPermissionForTemplate(getState(), modelId, templateId, 'comment')
				expect(hasPermissionsAfterJobChange).toBe(false);
			});

			it('should not list templates for which the user does not have create permission', () => {
				const templateWithoutPermission = templateMockFactory({ config: { permissions: { create: ['someOtherUser'] } } });
				const templateWithPermission = templateMockFactory({ config: { permissions: { create: [user.username] } } });
				dispatch(TicketsActions.fetchTemplatesSuccess(modelId, [templateWithPermission, templateWithoutPermission]));
				const creatableTemplates = selectCreatableTemplates(getState(), modelId);
				const creatableTemplateIds = creatableTemplates.map(({ _id }) => _id);
				expect(creatableTemplateIds).not.toContain(templateWithoutPermission._id);
				expect(creatableTemplateIds).toContain(templateWithPermission._id);
			});
		})
	});



	describe('settings', () => {
		const riskCategories = mockRiskCategories();
		it('should set and fetch the risk categories', () => {
			dispatch(TicketsActions.fetchRiskCategoriesSuccess(riskCategories));
			const riskCategoriesFromStore = selectRiskCategories(getState());
			expect(riskCategoriesFromStore).toEqual(riskCategories);
		});
	});
});
