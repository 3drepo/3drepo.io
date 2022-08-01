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

import { INITIAL_STATE, containersReducer, ContainersActions, IContainersState } from '@/v5/store/containers/containers.redux';
import { selectContainerById, selectContainers, selectFavouriteContainers, selectHasContainers } from '@/v5/store/containers/containers.selectors';
import { times } from 'lodash';
import { containerMockFactory, prepareMockSettingsReply, prepareMockStats, prepareMockViews } from './containers.fixtures';
import { NewContainer, UploadStatuses } from '@/v5/store/containers/containers.types';
import { revisionsMockFactory } from '../revisions/revisions.fixtures';

describe('Containers: store', () => {
	const projectId = 'projectId';
	const initialState: IContainersState = INITIAL_STATE;

	const getNonEmptyInitialState = (containerOverrides = {}) => containersReducer(
		initialState,
		ContainersActions.fetchContainersSuccess(projectId, [containerMockFactory(containerOverrides)]),
	);

	it('should set containers', () => {
		const mockContainers = times(5, () => containerMockFactory());
		const resultState: IContainersState = containersReducer(
			initialState,
			ContainersActions.fetchContainersSuccess(projectId, mockContainers),
		);
		const containers = selectContainers.resultFunc(resultState, projectId);
		expect(containers).toEqual(mockContainers);
	});

	describe('Updating container attributes:', () => {
		it('should add container to favourites', () => {
			let containers = selectContainers.resultFunc(initialState, projectId);
			let favouriteContainers = selectFavouriteContainers.resultFunc(containers);
			expect(selectHasContainers.resultFunc(containers, favouriteContainers)).toEqual({
				favourites: false,
				all: false,
			});

			const newContainer = containerMockFactory({ isFavourite: false });
			const resultState: IContainersState = containersReducer(
				getNonEmptyInitialState(newContainer),
				ContainersActions.setFavouriteSuccess(projectId, newContainer._id, true),
			);
			containers = selectContainers.resultFunc(resultState, projectId);
			favouriteContainers = selectFavouriteContainers.resultFunc(containers);
			const containerIsIncluded = favouriteContainers.find(({ _id }) => _id === newContainer._id);
			expect(selectHasContainers.resultFunc(containers, favouriteContainers)).toEqual({
				favourites: true,
				all: true,
			});

			expect(containerIsIncluded).toBeTruthy();
		});

		it('should remove container from favourites', () => {
			let containers = selectContainers.resultFunc(initialState, projectId);
			let favouriteContainers = selectFavouriteContainers.resultFunc(containers);
			expect(selectHasContainers.resultFunc(containers, favouriteContainers)).toEqual({
				favourites: false,
				all: false,
			});
			const newContainer = containerMockFactory({ isFavourite: true });
			const resultState: IContainersState = containersReducer(
				getNonEmptyInitialState(newContainer),
				ContainersActions.setFavouriteSuccess(projectId, newContainer._id, false),
			);
			containers = selectContainers.resultFunc(resultState, projectId);
			favouriteContainers = selectFavouriteContainers.resultFunc(containers);
			const containerIsIncluded = favouriteContainers.find(({ _id }) => _id === newContainer._id);
	
			expect(containerIsIncluded).not.toBeTruthy();
			expect(selectHasContainers.resultFunc(containers, favouriteContainers)).toEqual({
				favourites: false,
				all: true,
			});
		});

		it('should update container stats', () => {
			const stats = prepareMockStats();
			const newContainer = containerMockFactory({ status: null });
			const resultState: IContainersState = containersReducer(
				getNonEmptyInitialState(newContainer),
				ContainersActions.fetchContainerStatsSuccess(projectId, newContainer._id, stats),
			);
			const containers = selectContainers.resultFunc(resultState, projectId);
			const containerFromState = selectContainerById.resultFunc(containers, newContainer._id);

			expect(containerFromState.code).toEqual(stats.code);
			expect(containerFromState.unit).toEqual(stats.unit);
			expect(containerFromState.status).toEqual(stats.status);
			expect(containerFromState.type).toEqual(stats.type);
		});

		it('should update container status', () => {
			const newContainer = containerMockFactory({ status: UploadStatuses.GENERATING_BUNDLES });
			const newStatus = UploadStatuses.OK;
			const resultState: IContainersState = containersReducer(
				getNonEmptyInitialState(newContainer),
				ContainersActions.setContainerStatus(projectId, newContainer._id, newStatus),
			);
			const containers = selectContainers.resultFunc(resultState, projectId);
			const containerFromState = selectContainerById.resultFunc(containers, newContainer._id);

			expect(containerFromState.status).toEqual(newStatus);
		});

		it('should update container views', () => {
			const views = prepareMockViews();
			const newContainer = containerMockFactory({ status: null });
			const resultState: IContainersState = containersReducer(
				getNonEmptyInitialState(newContainer),
				ContainersActions.fetchContainerViewsSuccess(projectId, newContainer._id, views),
			);
			const containers = selectContainers.resultFunc(resultState, projectId);
			const containerFromState = selectContainerById.resultFunc(containers, newContainer._id);

			expect(containerFromState.views.length).toEqual(views.length);
		});

		it('should update container settings (fetch)', () => {
			const settings = prepareMockSettingsReply(containerMockFactory());
			const newContainer = containerMockFactory({ surveyPoint: null });
			const resultState: IContainersState = containersReducer(
				getNonEmptyInitialState(newContainer),
				ContainersActions.fetchContainerSettingsSuccess(projectId, newContainer._id, settings),
			);
			const containers = selectContainers.resultFunc(resultState, projectId);
			const containerFromState = selectContainerById.resultFunc(containers, newContainer._id);

			expect(containerFromState.surveyPoint.latLong).toEqual(settings.surveyPoint.latLong);
			expect(containerFromState.surveyPoint.position).toEqual(settings.surveyPoint.position);
		});

		it('should update container settings (update)', () => {
			const settings = prepareMockSettingsReply(containerMockFactory());
			const newContainer = containerMockFactory({ surveyPoint: null });
			const resultState: IContainersState = containersReducer(
				getNonEmptyInitialState(newContainer),
				ContainersActions.updateContainerSettingsSuccess(projectId, newContainer._id, settings),
			);
			const containers = selectContainers.resultFunc(resultState, projectId);
			const containerFromState = selectContainerById.resultFunc(containers, newContainer._id);

			expect(containerFromState.surveyPoint.latLong).toEqual(settings.surveyPoint.latLong);
			expect(containerFromState.surveyPoint.position).toEqual(settings.surveyPoint.position);
		});

		it('should update revision processing status', () => {
			const newRevision = revisionsMockFactory();
			const newContainer = containerMockFactory();
			const resultState = containersReducer(
				getNonEmptyInitialState(newContainer),
				ContainersActions.containerProcessingSuccess(projectId, newContainer._id, newRevision)
			);
			const containers = selectContainers.resultFunc(resultState, projectId);
			const containerFromState = selectContainerById.resultFunc(containers, newContainer._id);

			expect(containerFromState.revisionsCount).toEqual(newContainer.revisionsCount + 1);
			expect(containerFromState.latestRevision).toEqual(newRevision.tag);
			expect(containerFromState.lastUpdated).toEqual(newRevision.timestamp);
		});
	});

	describe('Updating container list:', () => {
		it('should create new container', () => {
			const newContainer = containerMockFactory() as NewContainer;
			const resultState: IContainersState = containersReducer(
				getNonEmptyInitialState(),
				ContainersActions.createContainerSuccess(projectId, newContainer),
			);
			const containers = selectContainers.resultFunc(resultState, projectId);
			const containerIsIncluded = selectContainerById.resultFunc(containers, newContainer._id);
			expect(containerIsIncluded).toBeTruthy();
		});

		it('should delete container', () => {
			const newContainer = containerMockFactory() as NewContainer;
			const resultState: IContainersState = containersReducer(
				getNonEmptyInitialState(newContainer),
				ContainersActions.deleteContainerSuccess(projectId, newContainer._id),
			);
			const containers = selectContainers.resultFunc(resultState, projectId);
			const containerIsIncluded = selectContainerById.resultFunc(containers, newContainer._id);
			console.log(containerIsIncluded)
			expect(containerIsIncluded).toBeFalsy();
		});
	});
})
