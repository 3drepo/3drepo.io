/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { DrawingsActions } from '@/v5/store/drawings/drawings.redux';
import { DrawingRevisionsActions } from '@/v5/store/drawings/revisions/drawingRevisions.redux';
import {
	selectIsPending,
	selectRevisions,
	selectUploadError,
	selectUploadIsComplete,
	selectUploadProgress,
	selectUploads,
} from '@/v5/store/drawings/revisions/drawingRevisions.selectors';
import { times } from 'lodash';
import { createTestStore } from '../../test.helpers';
import { drawingMockFactory } from '../drawings.fixtures';
import { drawingRevisionsMockFactory } from './drawingRevisions.fixtures';

describe('Drawing Revisions: store', () => {
	const drawing = drawingMockFactory();
	const projectId = 'projectId';
	const uploadId = 'uploadId';
	let dispatch, getState;

	beforeEach(() => {
		({ dispatch, getState } = createTestStore());
		dispatch(DrawingsActions.fetchDrawingsSuccess(projectId, [drawing]));
	});

	it('should set revisions for given drawing', () => {
		const mockRevisions = times(2, () => drawingRevisionsMockFactory());
		dispatch(DrawingRevisionsActions.fetchSuccess(drawing._id, mockRevisions));
		const revisions = selectRevisions(getState(), drawing._id);

		expect(revisions[0]).toEqual(mockRevisions[0]);
		expect(revisions[1]).toEqual(mockRevisions[1]);
	});

	describe('Updating revision attributes:', () => {
		it('should set pending state for revisions', () => {
			const mockIsPending = true;
			dispatch(DrawingRevisionsActions.setIsPending(drawing._id, mockIsPending));
			const drawingIsPending = selectIsPending(getState(), drawing._id);
			expect(drawingIsPending).toEqual(mockIsPending);
		});

		it('should set upload status', () => {
			const mockRevision = drawingRevisionsMockFactory();
			const mockUploadProgress = 15;
			const mockUploadError = 'ERROR!!!';
			
			let uploads = selectUploads(getState());
			expect(uploads[uploadId]).toBeFalsy();
		
			dispatch(DrawingRevisionsActions.fetchSuccess(drawing._id, [mockRevision]));
			dispatch(DrawingRevisionsActions.setUploadComplete(uploadId, false, mockUploadError));
			dispatch(DrawingRevisionsActions.setUploadProgress(uploadId, mockUploadProgress));
			dispatch(DrawingRevisionsActions.setUploadComplete(uploadId, true, mockUploadError));

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
			const mockRevision = drawingRevisionsMockFactory();
			dispatch(DrawingRevisionsActions.fetchSuccess(drawing._id, []));
			dispatch(DrawingRevisionsActions.revisionProcessingSuccess(drawing._id, mockRevision));
			const [revision] = selectRevisions(getState(), drawing._id);
			expect(revision).toEqual(mockRevision);
		});

		it('should update revision', () => {
			const mockRevision = drawingRevisionsMockFactory();
			const mockRevisionData = drawingRevisionsMockFactory({ _id: mockRevision._id });
			dispatch(DrawingRevisionsActions.fetchSuccess(drawing._id, [mockRevision]));
			dispatch(DrawingRevisionsActions.updateRevisionSuccess(drawing._id, mockRevisionData));

			const [revision] = selectRevisions(getState(), drawing._id);
			expect(revision).toEqual(mockRevisionData)
		});

		it('should set void status', () => {
			const mockIsVoid = true;
			const mockRevision = drawingRevisionsMockFactory({ void: !mockIsVoid });
			dispatch(DrawingRevisionsActions.fetchSuccess(drawing._id, [mockRevision]));
			dispatch(DrawingRevisionsActions.setVoidStatusSuccess(drawing._id, mockRevision._id, mockIsVoid));
			const [revision] = selectRevisions(getState(), drawing._id);
			expect(revision.void).toBe(mockIsVoid);
		});
	});
});
