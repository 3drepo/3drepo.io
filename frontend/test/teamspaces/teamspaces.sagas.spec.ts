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

import { expectSaga } from 'redux-saga-test-plan';

import { TeamspacesActions } from '@/v5/store/teamspaces/teamspaces.redux';
import * as TeamspacesSaga from '@/v5/store/teamspaces/teamspaces.sagas';
import { mockServer } from '../../internals/testing/mockServer';
import { quotaMockFactory } from './teamspaces.fixtures';
import { createTestStore } from '../test.helpers';
import { fullTemplateMockFactory, templateMockFactory } from '../tickets/tickets.fixture';
import { DialogsTypes } from '@/v5/store/dialogs/dialogs.redux';
import { selectTeamspaceTemplateById, selectTemplatesByTeamspace } from '@/v5/store/teamspaces/teamspaces.selectors';
import { ITemplate } from '@/v5/store/tickets/tickets.types';

describe('Teamspaces: sagas', () => {
	const teamspaceName = 'teamspaceId';
	const teamspace = { name: teamspaceName, isAdmin: true };
	const teamspaces = [teamspace];
	const templateId = 'templateId';
	const template = templateMockFactory({ _id: templateId }) as ITemplate;
	let dispatch, getState, waitForActions;

	beforeEach(() => {
		({ dispatch, getState, waitForActions } = createTestStore());
	});

	describe('fetch', () => {
		it('should fetch teamspaces data and dispatch FETCH_SUCCESS', async () => {
			mockServer
				.get(`/teamspaces`)
				.reply(200, { teamspaces });

			await expectSaga(TeamspacesSaga.default)
					.dispatch(TeamspacesActions.fetch())
					.dispatch(TeamspacesActions.setTeamspacesArePending(true))
					.put(TeamspacesActions.fetchSuccess(teamspaces))
					.dispatch(TeamspacesActions.setTeamspacesArePending(false))
					.silentRun();
		});

		it('should handle teamspaces api error and dispatch FETCH_FAILURE', async () => {
			mockServer
				.get(`/teamspaces`)
				.reply(404);

			await expectSaga(TeamspacesSaga.default)
				.dispatch(TeamspacesActions.fetch())
				.dispatch(TeamspacesActions.setTeamspacesArePending(true))
				.dispatch(TeamspacesActions.setTeamspacesArePending(false))
				.silentRun();
		});
	});

	it('should fetch quota data and dispatch FETCH_QUOTA_SUCCESS', async () => {
		const teamspace = 'MyTeamspace';
		const quota = quotaMockFactory();

		mockServer
			.get(`/teamspaces/${teamspace}/quota`)
			.reply(200, quota);

		await expectSaga(TeamspacesSaga.default)
				.dispatch(TeamspacesActions.fetchQuota(teamspace))
				.put(TeamspacesActions.fetchQuotaSuccess(teamspace, quota))
				.silentRun();
	});

	describe('templates', () => {
	
		beforeEach(() => { 
			dispatch(TeamspacesActions.fetchSuccess(teamspaces));
		});

		describe('fetchTemplates', () => {
			it('should call fetchTemplates endpoint', async () => {
				mockServer
					.get(`/teamspaces/${teamspaceName}/settings/tickets/templates`)
					.reply(200, { templates: [template] });
	
				await waitForActions(() => {
					dispatch(TeamspacesActions.fetchTemplates(teamspaceName))
				}, [TeamspacesActions.fetchTemplatesSuccess(teamspaceName, [template])]);
	
				const templatesInStore = selectTemplatesByTeamspace(getState(), teamspaceName);
				expect(templatesInStore).toEqual([template]);
			})
	
			it('should call fetchTemplates endpoint with 404', async () => {
				mockServer
					.get(`/teamspaces/${teamspaceName}/settings/tickets/templates`)
					.reply(404);
	
				await waitForActions(() => {
					dispatch(TeamspacesActions.fetchTemplates(teamspaceName));
				}, [DialogsTypes.OPEN]);
	
				const templatesInStore = selectTemplatesByTeamspace(getState(), teamspaceName);
				expect(templatesInStore).toEqual([]);
			})
		})
	
		describe('fetchTemplate', () => {
			const fullTemplate: ITemplate = fullTemplateMockFactory({ _id: templateId });
	
			beforeEach(() => { 
				dispatch(TeamspacesActions.fetchTemplatesSuccess(teamspaceName, [template]));
			});
	
			it('should call fetchTemplate endpoint', async () => {
				mockServer
					.get(`/teamspaces/${teamspaceName}/settings/tickets/templates/${templateId}`)
					.reply(200, fullTemplate);
	
				await waitForActions(() => {
					dispatch(TeamspacesActions.fetchTemplate(teamspaceName, templateId))
				}, [TeamspacesActions.replaceTemplateSuccess(teamspaceName, fullTemplate)]);
	
				const templateInStore = selectTeamspaceTemplateById(getState(), teamspaceName, templateId);
				expect(templateInStore).toEqual(fullTemplate);
			})
	
			it('should call fetchTemplate endpoint with 404', async () => {
				mockServer
					.get(`/teamspaces/${teamspaceName}/settings/tickets/templates/${templateId}`)
					.reply(404);
	
				await waitForActions(() => {
					dispatch(TeamspacesActions.fetchTemplate(teamspaceName, templateId));
				}, [DialogsTypes.OPEN]);
	
				const templateInStore = selectTeamspaceTemplateById(getState(), teamspaceName, templateId);
				expect(templateInStore).toEqual(template);
			})
		})
	})
});
