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

import { mockServer } from '../../internals/testing/mockServer';
import * as RevisionsSaga from '@/v5/store/revisions/revisions.sagas';
import { RevisionsActions } from '@/v5/store/revisions/revisions.redux';
import api from '@/v5/services/api/default';
import { ContainersActions } from '@/v5/store/containers/containers.redux';
import { mockCreateRevisionBody, revisionsMockFactory } from './revisions.fixtures';
import { UploadStatuses } from '@/v5/store/containers/containers.types';
import { spyOnAxiosApiCallWithFile } from '../test.helpers';

describe('Revisions: sagas', () => {
	const teamspace = 'teamspace';
	const projectId = 'projectId';
	const containerId = 'containerId';

	describe('fetch', () => {
		it('should fetch revisions data and dispatch FETCH_SUCCESS', async () => {
			mockServer
					.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/revisions?showVoid=true`)
					.reply(200, {
						revisions: []
					});

			await expectSaga(RevisionsSaga.default)
					.dispatch(RevisionsActions.fetch(teamspace, projectId, containerId))
					.put(RevisionsActions.setIsPending(containerId, true))
					.put(RevisionsActions.fetchSuccess(containerId, []))
					.put(RevisionsActions.setIsPending(containerId, false))
					.silentRun();
		});

		it('should handle revisions api error', async () => {
			mockServer
					.get(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/revisions?showVoid=true`)
					.reply(404);

			await expectSaga(RevisionsSaga.default)
					.dispatch(RevisionsActions.fetch(teamspace, projectId, containerId))
					.put(RevisionsActions.setIsPending(containerId, true))
					.put(RevisionsActions.setIsPending(containerId, false))
					.silentRun();
		});
	});

	describe('setVoidStatus', () => {
		const revisionId = 'revisionId';
		const isVoid = true;

		it('should set void status to true and dispatch SET_VOID_STATUS_SUCCESS', async () => {
			mockServer
					.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/revisions/${revisionId}`)
					.reply(200);

			await expectSaga(RevisionsSaga.default)
					.dispatch(RevisionsActions.setVoidStatus(teamspace, projectId, containerId, revisionId, isVoid))
					.put(RevisionsActions.setVoidStatusSuccess(containerId, revisionId, isVoid))
					.silentRun();
		});

		it('should handle api error', async () => {
			mockServer
					.patch(`/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/revisions/${revisionId}`)
					.reply(404);

			await expectSaga(RevisionsSaga.default)
					.dispatch(RevisionsActions.setVoidStatus(teamspace, projectId, containerId, revisionId, isVoid))
					.silentRun();
		});
	});

	describe('createRevision', () => {

		const uploadId = 'uploadId';
		const mockBody = mockCreateRevisionBody();
		const newContainerMockBody = {...mockBody, containerId: ''};

		// const post = api.post;
		// const spy = jest.spyOn(api, 'post').mockImplementation((url, body) => {
		// 	// Transforms the formData to a string to avoid a problem with axios
		// 	// in its node implementation.
		// 	return post(url, body.toString());
		// });
		const spy = spyOnAxiosApiCallWithFile(api, 'post');

		it('should create a revision on an existing container', async () => {

			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/containers/${mockBody.containerId}/revisions`)
				.reply(200, {body: {}});

			await expectSaga(RevisionsSaga.default)
				.dispatch(RevisionsActions.createRevision(teamspace, projectId, uploadId, mockBody))
				.put(RevisionsActions.setUploadComplete(uploadId, false))
				.put(ContainersActions.setContainerStatus(projectId, mockBody.containerId, UploadStatuses.QUEUED))
				.put(RevisionsActions.setUploadComplete(uploadId, true))
				.silentRun();

			spy.mockClear();
		})

		it('should create a revision on a new container', async () => {
			
			const newContainer = {
				_id: 'newContainerId',
				name: mockBody.containerName,
				unit: mockBody.containerUnit,
				type: mockBody.containerType,
				code: mockBody.containerCode,
				desc: mockBody.containerDesc,
			};

			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/containers`)
				.reply(200, { _id: newContainer._id })
				.post(`/teamspaces/${teamspace}/projects/${projectId}/containers/${newContainer._id}/revisions`)
				.reply(200, {body: {}});

			await expectSaga(RevisionsSaga.default)
				.dispatch(RevisionsActions.createRevision(teamspace, projectId, uploadId, newContainerMockBody))
				.put(ContainersActions.createContainerSuccess(projectId, newContainer))
				.put(RevisionsActions.setUploadComplete(uploadId, false))
				.put(ContainersActions.setContainerStatus(projectId, newContainer._id, UploadStatuses.QUEUED))
				.put(RevisionsActions.setUploadComplete(uploadId, true))
				.silentRun();

			spy.mockClear();
		})

		it('should 400 on revision creation and prepare an error message', async () => {
			const status = 400;
			const code = 'ERROR_CODE';
			const message = 'Error Message'
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/containers/${mockBody.containerId}/revisions`)
				.reply(400, { status, code, message});

			await expectSaga(RevisionsSaga.default)
				.dispatch(RevisionsActions.createRevision(teamspace, projectId, uploadId, mockBody))
				.put(RevisionsActions.setUploadComplete(uploadId, false))
				.put(RevisionsActions.setUploadComplete(uploadId, true, `${status} - ${code} (${message})`))
				.silentRun();

			spy.mockClear();
		})

		it('should 400 on container creation and not create revision', async () => {
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/containers`)
				.reply(400)

			await expectSaga(RevisionsSaga.default)
				.dispatch(RevisionsActions.createRevision(teamspace, projectId, uploadId, newContainerMockBody))
				.put(RevisionsActions.setUploadComplete(uploadId, true, 'Failed to create Container'))
				.silentRun();

			spy.mockClear();
		})
	})
})
