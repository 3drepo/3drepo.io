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

import { ContainersActions } from '@/v5/store/containers/containers.redux';
import { selectContainerById, selectContainers, selectFavouriteContainers } from '@/v5/store/containers/containers.selectors';
import { times } from 'lodash';
import { containerMockFactory, prepareMockSettingsReply, prepareMockStats, prepareMockViews } from './containers.fixtures';
import { NewContainer, UploadStatuses } from '@/v5/store/containers/containers.types';
import { revisionsMockFactory } from '../revisions/revisions.fixtures';
import { combineReducers, createStore } from 'redux';
import reducers from '@/v5/store/reducers';
import { ProjectsActions } from '@/v5/store/projects/projects.redux';

const containerListIncludesContainer = (containerList, container) => (
	containerList.map(({ _id }) => _id).includes(container._id)
);

describe('Containers: store', () => {
	const { dispatch, getState } = createStore(combineReducers(reducers));
	const projectId = 'projectId';
	dispatch(ProjectsActions.setCurrentProject(projectId));

	const createAndAddContainerToStore = (containerOverrides = {}) => {
		const newContainer = containerMockFactory(containerOverrides);
		dispatch(ContainersActions.fetchContainersSuccess(projectId, [newContainer]));
		return newContainer;
	};

	it('should set containers', () => {
		const mockContainers = times(5, () => containerMockFactory());
		dispatch(ContainersActions.fetchContainersSuccess(projectId, mockContainers));
		const containers = selectContainers(getState());
		expect(containers).toEqual(mockContainers);
	});

	describe('Updating container attributes:', () => {
		it('should add container to favourites', () => {
			const newContainer = createAndAddContainerToStore({ isFavourite: false });
			dispatch(ContainersActions.setFavouriteSuccess(projectId, newContainer._id, true));
			const favouriteContainers = selectFavouriteContainers(getState());
			const containerIsIncluded = containerListIncludesContainer(favouriteContainers, newContainer);

			expect(containerIsIncluded).toBeTruthy();
		});

		it('should remove container from favourites', () => {
			const newContainer = createAndAddContainerToStore({ isFavourite: true });
			dispatch(ContainersActions.setFavouriteSuccess(projectId, newContainer._id, false));
			const favouriteContainers = selectFavouriteContainers(getState());
			const containerIsIncluded = containerListIncludesContainer(favouriteContainers, newContainer);

			expect(containerIsIncluded).not.toBeTruthy();
		});

		it('should update container stats', () => {
			const stats = prepareMockStats();
			const newContainer = createAndAddContainerToStore({ status: null });
			dispatch(ContainersActions.fetchContainerStatsSuccess(projectId, newContainer._id, stats));
			const containerFromState = selectContainerById(getState(), newContainer._id);

			expect(containerFromState.code).toEqual(stats.code);
			expect(containerFromState.unit).toEqual(stats.unit);
			expect(containerFromState.status).toEqual(stats.status);
			expect(containerFromState.type).toEqual(stats.type);
		});

		it('should update container status', () => {
			const newStatus = UploadStatuses.OK;
			const newContainer = createAndAddContainerToStore({ status: UploadStatuses.GENERATING_BUNDLES });
			dispatch(ContainersActions.setContainerStatus(projectId, newContainer._id, newStatus));
			const containerFromState = selectContainerById(getState(), newContainer._id);

			expect(containerFromState.status).toEqual(newStatus);
		});

		it('should update container views', () => {
			const views = prepareMockViews();
			const newContainer = createAndAddContainerToStore({ status: null });
			dispatch(ContainersActions.fetchContainerViewsSuccess(projectId, newContainer._id, views));
			const containerFromState = selectContainerById(getState(), newContainer._id);

			expect(containerFromState.views.length).toEqual(views.length);
		});

		it('should update container settings (fetch)', () => {
			const settings = prepareMockSettingsReply(containerMockFactory());
			const newContainer = createAndAddContainerToStore({ surveyPoint: null });
			dispatch(ContainersActions.fetchContainerSettingsSuccess(projectId, newContainer._id, settings));
			const containerFromState = selectContainerById(getState(), newContainer._id);

			expect(containerFromState.surveyPoint.latLong).toEqual(settings.surveyPoint.latLong);
			expect(containerFromState.surveyPoint.position).toEqual(settings.surveyPoint.position);
		});

		it('should update container settings (update)', () => {
			const settings = prepareMockSettingsReply(containerMockFactory());
			const newContainer = createAndAddContainerToStore({ surveyPoint: null });
			dispatch(ContainersActions.updateContainerSettingsSuccess(projectId, newContainer._id, settings));
			const containerFromState = selectContainerById(getState(), newContainer._id);

			expect(containerFromState.surveyPoint.latLong).toEqual(settings.surveyPoint.latLong);
			expect(containerFromState.surveyPoint.position).toEqual(settings.surveyPoint.position);
		});

		it('should update revision processing status', () => {
			const newRevision = revisionsMockFactory();
			const newContainer = createAndAddContainerToStore();
			dispatch(ContainersActions.containerProcessingSuccess(projectId, newContainer._id, newRevision));
			const containerFromState = selectContainerById(getState(), newContainer._id);

			expect(containerFromState.revisionsCount).toEqual(newContainer.revisionsCount + 1);
			expect(containerFromState.latestRevision).toEqual(newRevision.tag);
			expect(containerFromState.lastUpdated).toEqual(newRevision.timestamp);
		});
	});

	describe('Updating container list:', () => {
		it('should create new container', () => {
			const newContainer = createAndAddContainerToStore() as NewContainer;
			dispatch(ContainersActions.createContainerSuccess(projectId, newContainer));
			const containerIsIncluded = selectContainerById(getState(), newContainer._id);
			expect(containerIsIncluded).toBeTruthy();
		});

		it('should delete container', () => {
			const newContainer = createAndAddContainerToStore() as NewContainer;
			dispatch(ContainersActions.deleteContainerSuccess(projectId, newContainer._id));
			const containerIsIncluded = selectContainerById(getState(), newContainer._id);
			expect(containerIsIncluded).toBeFalsy();
		});
	});
})
