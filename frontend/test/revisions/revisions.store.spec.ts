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

import { ContainersActions } from '@/v5/store/containers/containers.redux';
import { RevisionsActions } from '@/v5/store/revisions/revisions.redux';
import {
	selectIsPending,
	selectRevisions,
	selectUploadError,
	selectUploadIsComplete,
	selectUploadProgress,
	selectUploads,
} from '@/v5/store/revisions/revisions.selectors';
import { times } from 'lodash';
import { createTestStore } from '../test.helpers';
import { containerMockFactory } from '../containers/containers.fixtures';
import { revisionsMockFactory } from './revisions.fixtures';

describe('Revisions: store', () => {
	const container = containerMockFactory();
	const projectId = 'projectId';
	const uploadId = 'uploadId';
	let dispatch, getState;

	beforeEach(() => {
		({ dispatch, getState } = createTestStore());
		dispatch(ContainersActions.fetchContainersSuccess(projectId, [container]));
	});

	it('should set revisions for given container', () => {
		const mockRevisions = times(2, () => revisionsMockFactory());
		dispatch(RevisionsActions.fetchSuccess(container._id, mockRevisions));
		const revisions = selectRevisions(getState(), container._id);

		expect(revisions[0]).toEqual(mockRevisions[0]);
		expect(revisions[1]).toEqual(mockRevisions[1]);
	});

	describe('Updating revision attributes:', () => {
		it('should set pending state for revisions', () => {
			const mockIsPending = true;
			dispatch(RevisionsActions.setIsPending(container._id, mockIsPending));
			const containerIsPending = selectIsPending(getState(), container._id);
			expect(containerIsPending).toEqual(mockIsPending);
		});

		it('should set upload status', () => {
			const mockRevision = revisionsMockFactory();
			const mockUploadProgress = 15;
			const mockUploadError = 'ERROR!!!';
			
			let uploads = selectUploads(getState());
			expect(uploads[uploadId]).toBeFalsy();
		
			dispatch(RevisionsActions.fetchSuccess(container._id, [mockRevision]));
			dispatch(RevisionsActions.setUploadComplete(uploadId, false, mockUploadError));
			dispatch(RevisionsActions.setUploadProgress(uploadId, mockUploadProgress));
			dispatch(RevisionsActions.setUploadComplete(uploadId, true, mockUploadError));

			uploads = selectUploads(getState());
			const uploadProgress = selectUploadProgress(getState(), uploadId);
			const uploadError = selectUploadError(getState(), uploadId);
			const uploadIsComplete = selectUploadIsComplete(getState());

			expect(uploads[uploadId]).toBeTruthy();
			expect(uploadProgress).toEqual(mockUploadProgress);
			expect(uploadError).toEqual(mockUploadError);
			expect(uploadIsComplete).toBe(true);
		});

		it('should add single revision', () => {
			const mockRevision = revisionsMockFactory();
			dispatch(RevisionsActions.fetchSuccess(container._id, []));
			dispatch(RevisionsActions.revisionProcessingSuccess(container._id, mockRevision));
			const [revision] = selectRevisions(getState(), container._id);
			expect(revision).toEqual(mockRevision);
		});

		it('should update revision', () => {
			const mockRevision = revisionsMockFactory();
			const mockRevisionData = revisionsMockFactory({ _id: mockRevision._id });
			dispatch(RevisionsActions.fetchSuccess(container._id, [mockRevision]));
			dispatch(RevisionsActions.updateRevisionSuccess(container._id, mockRevisionData));

			const [revision] = selectRevisions(getState(), container._id);
			expect(revision).toEqual(mockRevisionData)
		});

		it('should set void status', () => {
			const mockIsVoid = true;
			const mockRevision = revisionsMockFactory({ void: !mockIsVoid });
			dispatch(RevisionsActions.fetchSuccess(container._id, [mockRevision]));
			dispatch(RevisionsActions.setVoidStatusSuccess(container._id, mockRevision._id, mockIsVoid));
			const [revision] = selectRevisions(getState(), container._id);
			expect(revision.void).toBe(mockIsVoid);
		});
	});
});
