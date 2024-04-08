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
import { selectCanUploadToProject, selectContainerById, selectContainers, selectFavouriteContainers, selectHasCollaboratorAccess, selectHasCommenterAccess } from '@/v5/store/containers/containers.selectors';
import { times } from 'lodash';
import { containerMockFactory, prepareMockSettingsReply, prepareMockStats, prepareMockViews } from './containers.fixtures';
import { NewContainer, UploadStatus } from '@/v5/store/containers/containers.types';
import { containerRevisionsMockFactory } from './containerRevisions/containerRevisions.fixtures';
import { ProjectsActions } from '@/v5/store/projects/projects.redux';
import { createTestStore, listContainsElementWithId } from '../test.helpers';
import { Role } from '@/v5/store/currentUser/currentUser.types';

describe('Containers: store', () => {
	let dispatch, getState;
	const projectId = 'projectId';

	beforeEach(() => {
		({ dispatch, getState } = createTestStore());
		dispatch(ProjectsActions.setCurrentProject(projectId));
	})

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
			const containerIsIncluded = listContainsElementWithId(favouriteContainers, newContainer);

			expect(containerIsIncluded).toBeTruthy();
		});

		it('should remove container from favourites', () => {
			const newContainer = createAndAddContainerToStore({ isFavourite: true });
			dispatch(ContainersActions.setFavouriteSuccess(projectId, newContainer._id, false));
			const favouriteContainers = selectFavouriteContainers(getState());
			const containerIsIncluded = listContainsElementWithId(favouriteContainers, newContainer);

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
			const newStatus = UploadStatus.OK;
			const newContainer = createAndAddContainerToStore({ status: UploadStatus.GENERATING_BUNDLES });
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
			const newRevision = containerRevisionsMockFactory();
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

	describe('Container permissions:', () => {
		const CreateContainerWithRole = (role) => {
			const newContainer = createAndAddContainerToStore({ role }) as NewContainer;
			const hasCollaboratorAccess = selectHasCollaboratorAccess(getState(), newContainer._id);
			const hasCommenterAccess = selectHasCommenterAccess(getState(), newContainer._id);
			const canUpload = selectCanUploadToProject(getState());

			return { hasCollaboratorAccess, hasCommenterAccess, canUpload }
		}

		it('should return Project Admins access rights', () => {
			const { hasCollaboratorAccess, hasCommenterAccess, canUpload } = CreateContainerWithRole(Role.ADMIN)
			expect(hasCollaboratorAccess).toBeTruthy();
			expect(hasCommenterAccess).toBeTruthy();
			expect(canUpload).toBeTruthy();
		});
		it('should return Collaborators access rights', () => {
			const { hasCollaboratorAccess, hasCommenterAccess, canUpload } = CreateContainerWithRole(Role.COLLABORATOR)
			expect(hasCollaboratorAccess).toBeTruthy();
			expect(hasCommenterAccess).toBeTruthy();
			expect(canUpload).toBeTruthy();
		});
		it('should return Commenters access rights', () => {
			const { hasCollaboratorAccess, hasCommenterAccess, canUpload } = CreateContainerWithRole(Role.COMMENTER)
			expect(hasCollaboratorAccess).toBeFalsy();
			expect(hasCommenterAccess).toBeTruthy();
			expect(canUpload).toBeFalsy();
		});
		it('should return Viewers access rights', () => {
			const { hasCollaboratorAccess, hasCommenterAccess, canUpload } = CreateContainerWithRole(Role.VIEWER)
			expect(hasCollaboratorAccess).toBeFalsy();
			expect(hasCommenterAccess).toBeFalsy();
			expect(canUpload).toBeFalsy();
		});
	});
})
