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
import { mockServer } from '../../internals/testing/mockServer';
import { pick } from 'lodash';
import { prepareSingleDrawingData } from '@/v5/store/drawings/drawings.helpers';
import { drawingMockFactory, prepareMockStats } from './drawings.fixtures';
import { createTestStore } from '../test.helpers';
import { ProjectsActions } from '@/v5/store/projects/projects.redux';
import { selectDrawingById, selectDrawings } from '@/v5/store/drawings/drawings.selectors';
import { DialogsTypes } from '@/v5/store/dialogs/dialogs.redux';
import { getWaitablePromise } from '@/v5/helpers/async.helpers';
import { NewDrawing } from '@/v5/store/drawings/drawings.types';

describe('Drawings: sagas', () => {
	const teamspace = 'teamspace';
	const projectId = 'projectId';
	const drawingId = 'drawingId';
	let onSuccess, onError;
	let dispatch, getState, waitForActions;
	const mockDrawing = drawingMockFactory({ _id: drawingId }) as any;

	const populateStore = (drawing = mockDrawing) => {
		dispatch(DrawingsActions.fetchDrawingsSuccess(projectId, [drawing]));
	};

	beforeEach(() => {
		onSuccess = jest.fn();
		onError = jest.fn();
		({ dispatch, getState, waitForActions } = createTestStore());
		dispatch(ProjectsActions.setCurrentProject(projectId));
		dispatch(DrawingsActions.fetchDrawingsSuccess(projectId, []));
	})

	describe('addFavourite', () => {
		beforeEach(() => populateStore({ ...mockDrawing, isFavourite: false }));

		it('should call addFavourite endpoint', async () => {
			const { resolve, promiseToResolve } = getWaitablePromise();
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/drawings/favourites`)
				.reply(200, resolve)

			waitForActions(() => {
				dispatch(DrawingsActions.addFavourite(teamspace, projectId, drawingId))
			}, [DrawingsActions.setFavouriteSuccess(projectId, drawingId, true)]);
			await promiseToResolve;
		})

		it('should call addFavourite endpoint with 404 and revert change', async () => {
			mockServer
				.patch(`/teamspaces/${teamspace}/projects/${projectId}/drawings/favourites`)
				.reply(404)

			await waitForActions(() => {
				dispatch(DrawingsActions.addFavourite(teamspace, projectId, drawingId))
			}, [
				DrawingsActions.setFavouriteSuccess(projectId, drawingId, true),
				DialogsTypes.OPEN,
				DrawingsActions.setFavouriteSuccess(projectId, drawingId, false),
			])

			const { isFavourite } = selectDrawingById(getState(), drawingId);
			expect(isFavourite).toBeFalsy();
		})
	})

	describe('removeFavourite', () => {
		beforeEach(() => populateStore({ ...mockDrawing, isFavourite: true }));
		const { resolve, promiseToResolve } = getWaitablePromise();
		it('should call removeFavourite endpoint', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/drawings/favourites?ids=${drawingId}`)
				.reply(200, resolve)

			waitForActions(() => {
				dispatch(DrawingsActions.removeFavourite(teamspace, projectId, drawingId))
			}, [DrawingsActions.setFavouriteSuccess(projectId, drawingId, false)]),
			await promiseToResolve;
		})

		it('should call removeFavourite endpoint with 404 and revert change', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/drawings/favourites?ids=${drawingId}`)
				.reply(404)

			await waitForActions(() => {
				dispatch(DrawingsActions.removeFavourite(teamspace, projectId, drawingId))
			}, [
				DrawingsActions.setFavouriteSuccess(projectId, drawingId, false),
				DialogsTypes.OPEN,
				DrawingsActions.setFavouriteSuccess(projectId, drawingId, true),
			])

			const { isFavourite } = selectDrawingById(getState(), drawingId);
			expect(isFavourite).toBeTruthy();
		})
	})

	describe('fetchDrawings', () => {
		const stats = prepareMockStats();

		it('should fetch drawings data', async () => {
			const mockDrawingWithoutStats = prepareSingleDrawingData(mockDrawing);
			const mockDrawingBaseResponse = pick(mockDrawing, ['_id', 'name', 'role', 'isFavourite']);

			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/drawings`)
				.reply(200, { drawings: [mockDrawingBaseResponse] });

			await waitForActions(() => {
				dispatch(DrawingsActions.fetchDrawings(teamspace, projectId));
			}, [
				DrawingsActions.fetchDrawingsSuccess(projectId, [mockDrawingWithoutStats]),
				DrawingsActions.fetchDrawingStats(teamspace, projectId, mockDrawing._id),
			]);
		})

		it('should call fetch drawings data endpoint with 404', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/drawings`)
				.reply(404);

			await waitForActions(() => {
				dispatch(DrawingsActions.fetchDrawings(teamspace, projectId));
			}, [DialogsTypes.OPEN]);
			const drawingsInStore = selectDrawings(getState());
			expect(drawingsInStore).toEqual([]);
		})

		it('should fetch stats', async () => {
			populateStore();
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/drawings/${drawingId}/stats`)
				.reply(200, stats);

			await waitForActions(() => {
				dispatch(DrawingsActions.fetchDrawingStats(teamspace, projectId, drawingId));
			}, [DrawingsActions.fetchDrawingStatsSuccess(projectId, drawingId, stats)]);
		})

		it('should call fetch drawing stats endpoint with 401', async () => {
			populateStore();
			mockServer
				.get(`/teamspaces/${teamspace}/projects/${projectId}/drawings/${drawingId}/stats`)
				.reply(401);

			await waitForActions(() => {
				dispatch(DrawingsActions.fetchDrawingStats(teamspace, projectId, drawingId));
			}, [DialogsTypes.OPEN]);

			const drawingsInStore = selectDrawings(getState());
			expect(drawingsInStore).toEqual([mockDrawing]);
		})
	})

	describe('createDrawing', () => {
		const newDrawing = {
			name: 'Test Drawing',
			type: 'Other',
			number: 'number',
			desc: 'desc',
		};
		it('should call createDrawing endpoint', async () => {
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/drawings`, newDrawing)
				.reply(200, { _id: drawingId });

			const fetchedDrawing = { ...newDrawing, _id: drawingId }

			await waitForActions(() => {
				dispatch(DrawingsActions.createDrawing(teamspace, projectId, newDrawing as NewDrawing, onSuccess, onError))
			}, [DrawingsActions.createDrawingSuccess(projectId, fetchedDrawing)]);

			expect(onError).not.toHaveBeenCalled();
			expect(onSuccess).toHaveBeenCalled();	
		})
		
		it('should call createDrawing endpoint with 400', async () => {
			const { resolve, promiseToResolve } = getWaitablePromise();
			
			mockServer
				.post(`/teamspaces/${teamspace}/projects/${projectId}/drawings`)
				.reply(400);

			dispatch(DrawingsActions.createDrawing(
				teamspace,
				projectId,
				newDrawing as NewDrawing,
				onSuccess,
				() => { onError(); resolve()},
			));

			await promiseToResolve;

			const drawingsInStore = selectDrawings(getState());

			expect(drawingsInStore).toEqual([]);
			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		})
	})

	describe('deleteDrawing', () => {
		beforeEach(() => populateStore());
		
		it('should call deleteDrawing endpoint', async () => {
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/drawings/${drawingId}`)
				.reply(200);

			await waitForActions(() => {
				dispatch(DrawingsActions.deleteDrawing(teamspace, projectId, drawingId, onSuccess, onError));
			}, [DrawingsActions.deleteDrawingSuccess(projectId, drawingId)]);

			expect(onSuccess).toHaveBeenCalled();
			expect(onError).not.toHaveBeenCalled();
		})

		it('should call deleteDrawing endpoint with 404', async () => {
			const { resolve, promiseToResolve } = getWaitablePromise();
			mockServer
				.delete(`/teamspaces/${teamspace}/projects/${projectId}/drawings/${drawingId}`)
				.reply(404);

			const drawingsBefore = selectDrawings(getState());

			dispatch(DrawingsActions.deleteDrawing(
				teamspace,
				projectId,
				drawingId,
				onSuccess,
				() => { onError(); resolve(); },
			));

			await promiseToResolve;

			const drawingsAfter = selectDrawings(getState());
			expect(drawingsBefore).toEqual(drawingsAfter);
				
			expect(onSuccess).not.toHaveBeenCalled();
			expect(onError).toHaveBeenCalled();
		})
	})
})
