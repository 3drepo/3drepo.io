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
import { selectCanUploadToProject, selectDrawingById, selectDrawings, selectFavouriteDrawings, selectHasCollaboratorAccess, selectHasCommenterAccess } from '@/v5/store/drawings/drawings.selectors';
import { orderBy, times } from 'lodash';
import { drawingMockFactory, prepareMockStats } from './drawings.fixtures';
import { IDrawing, NewDrawing } from '@/v5/store/drawings/drawings.types';
import { ProjectsActions } from '@/v5/store/projects/projects.redux';
import { createTestStore, listContainsElementWithId } from '../test.helpers';
import { Role } from '@/v5/store/currentUser/currentUser.types';

describe('Drawings: store', () => {
	let dispatch, getState;
	const projectId = 'projectId';

	beforeEach(() => {
		({ dispatch, getState } = createTestStore());
		dispatch(ProjectsActions.setCurrentProject(projectId));
	})

	const createAndAddDrawingToStore = (drawingOverrides = {}) => {
		const newDrawing = drawingMockFactory(drawingOverrides);
		dispatch(DrawingsActions.fetchDrawingsSuccess(projectId, [newDrawing]));
		return newDrawing;
	};

	it('should set drawings', () => {
		const mockDrawings = times(5, () => drawingMockFactory());
		dispatch(DrawingsActions.fetchDrawingsSuccess(projectId, mockDrawings));
		const drawings = selectDrawings(getState());
		expect(new Set(drawings)).toEqual(new Set(mockDrawings));
	});

	it('the selector for drawings should return it sorted by date ', () => {
		const projectUpdatedDesc = (drawings: IDrawing[]) => drawings.map((d) => ({lastUpdated: d.lastUpdated, desc:d.desc }));
		const mockDrawings = times(5, () => drawingMockFactory());
		dispatch(DrawingsActions.fetchDrawingsSuccess(projectId, mockDrawings));
		const drawings = selectDrawings(getState());
		expect(projectUpdatedDesc(drawings)).toEqual(projectUpdatedDesc(orderBy(mockDrawings, 'lastUpdated', 'desc')));
	});

	describe('Updating drawing attributes:', () => {
		it('should add drawing to favourites', () => {
			const newDrawing = createAndAddDrawingToStore({ isFavourite: false });
			dispatch(DrawingsActions.setFavouriteSuccess(projectId, newDrawing._id, true));
			const favouriteDrawings = selectFavouriteDrawings(getState());
			const drawingIsIncluded = listContainsElementWithId(favouriteDrawings, newDrawing);

			expect(drawingIsIncluded).toBeTruthy();
		});

		it('should remove drawing from favourites', () => {
			const newDrawing = createAndAddDrawingToStore({ isFavourite: true });
			dispatch(DrawingsActions.setFavouriteSuccess(projectId, newDrawing._id, false));
			const favouriteDrawings = selectFavouriteDrawings(getState());
			const drawingIsIncluded = listContainsElementWithId(favouriteDrawings, newDrawing);

			expect(drawingIsIncluded).toBeFalsy();
		});

		it('should update drawing stats', () => {
			const newDrawing = createAndAddDrawingToStore();
			const stats = prepareMockStats();
			dispatch(DrawingsActions.fetchDrawingStatsSuccess(projectId, newDrawing._id, stats));
			const drawingFromState = selectDrawingById(getState(), newDrawing._id);

			expect(drawingFromState.number).toEqual(stats.number);
			expect(drawingFromState.calibration).toEqual(stats.calibration);
			expect(drawingFromState.status).toEqual(stats.status);
			expect(drawingFromState.type).toEqual(stats.type);
			expect(drawingFromState.desc).toEqual(stats.desc);
			expect(drawingFromState.revisionsCount).toEqual(stats.revisions.total);
		});
	});

	describe('Updating drawing list:', () => {
		it('should create new drawing', () => {
			const newDrawing = createAndAddDrawingToStore() as NewDrawing;
			dispatch(DrawingsActions.createDrawingSuccess(projectId, newDrawing));
			const drawingIsIncluded = selectDrawingById(getState(), newDrawing._id);
			expect(drawingIsIncluded).toBeTruthy();
		});

		it('should delete drawing', () => {
			const newDrawing = createAndAddDrawingToStore() as NewDrawing;
			dispatch(DrawingsActions.deleteDrawingSuccess(projectId, newDrawing._id));
			const drawingIsIncluded = selectDrawingById(getState(), newDrawing._id);
			expect(drawingIsIncluded).toBeFalsy();
		});
	});

	describe('Drawing permissions:', () => {
		const createDrawingWithRole = (role) => {
			const newDrawing = createAndAddDrawingToStore({ role }) as NewDrawing;
			const hasCollaboratorAccess = selectHasCollaboratorAccess(getState(), newDrawing._id);
			const hasCommenterAccess = selectHasCommenterAccess(getState(), newDrawing._id);
			const canUpload = selectCanUploadToProject(getState());

			return { hasCollaboratorAccess, hasCommenterAccess, canUpload }
		}

		it('should return Project Admins access rights', () => {
			const { hasCollaboratorAccess, hasCommenterAccess, canUpload } = createDrawingWithRole(Role.ADMIN)
			expect(hasCollaboratorAccess).toBeTruthy();
			expect(hasCommenterAccess).toBeTruthy();
			expect(canUpload).toBeTruthy();
		});
		it('should return Collaborators access rights', () => {
			const { hasCollaboratorAccess, hasCommenterAccess, canUpload } = createDrawingWithRole(Role.COLLABORATOR)
			expect(hasCollaboratorAccess).toBeTruthy();
			expect(hasCommenterAccess).toBeTruthy();
			expect(canUpload).toBeTruthy();
		});
		it('should return Commenters access rights', () => {
			const { hasCollaboratorAccess, hasCommenterAccess, canUpload } = createDrawingWithRole(Role.COMMENTER)
			expect(hasCollaboratorAccess).toBeFalsy();
			expect(hasCommenterAccess).toBeTruthy();
			expect(canUpload).toBeFalsy();
		});
		it('should return Viewers access rights', () => {
			const { hasCollaboratorAccess, hasCommenterAccess, canUpload } = createDrawingWithRole(Role.VIEWER)
			expect(hasCollaboratorAccess).toBeFalsy();
			expect(hasCommenterAccess).toBeFalsy();
			expect(canUpload).toBeFalsy();
		});
	});

	describe('Drawing fetch :', () => {
		const createDrawingWithRole = (role) => {
			const newDrawing = createAndAddDrawingToStore({ role }) as NewDrawing;
			const hasCollaboratorAccess = selectHasCollaboratorAccess(getState(), newDrawing._id);
			const hasCommenterAccess = selectHasCommenterAccess(getState(), newDrawing._id);
			const canUpload = selectCanUploadToProject(getState());

			return { hasCollaboratorAccess, hasCommenterAccess, canUpload }
		}

		it('should return Project Admins access rights', () => {
			const { hasCollaboratorAccess, hasCommenterAccess, canUpload } = createDrawingWithRole(Role.ADMIN)
			expect(hasCollaboratorAccess).toBeTruthy();
			expect(hasCommenterAccess).toBeTruthy();
			expect(canUpload).toBeTruthy();
		});
		it('should return Collaborators access rights', () => {
			const { hasCollaboratorAccess, hasCommenterAccess, canUpload } = createDrawingWithRole(Role.COLLABORATOR)
			expect(hasCollaboratorAccess).toBeTruthy();
			expect(hasCommenterAccess).toBeTruthy();
			expect(canUpload).toBeTruthy();
		});
		it('should return Commenters access rights', () => {
			const { hasCollaboratorAccess, hasCommenterAccess, canUpload } = createDrawingWithRole(Role.COMMENTER)
			expect(hasCollaboratorAccess).toBeFalsy();
			expect(hasCommenterAccess).toBeTruthy();
			expect(canUpload).toBeFalsy();
		});
		it('should return Viewers access rights', () => {
			const { hasCollaboratorAccess, hasCommenterAccess, canUpload } = createDrawingWithRole(Role.VIEWER)
			expect(hasCollaboratorAccess).toBeFalsy();
			expect(hasCommenterAccess).toBeFalsy();
			expect(canUpload).toBeFalsy();
		});
	});
})
