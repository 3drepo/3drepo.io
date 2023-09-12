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

import { FederationsActions } from '@/v5/store/federations/federations.redux';
import { times } from 'lodash';
import { selectAreStatsPending, selectContainersByFederationId, selectFavouriteFederations, selectFederationById, selectFederations, selectHasCollaboratorAccess, selectHasCommenterAccess, selectIsListPending } from '@/v5/store/federations/federations.selectors';
import { ProjectsActions } from '@/v5/store/projects/projects.redux';
import { ContainersActions } from '@/v5/store/containers/containers.redux';
import { federationMockFactory, prepareMockContainers, prepareMockNewFederation, prepareMockSettingsReply, prepareMockStats } from './federations.fixtures';
import { createTestStore } from '../test.helpers';
import { containerMockFactory, prepareMockViews } from '../containers/containers.fixtures';
import { Role } from '@/v5/store/currentUser/currentUser.types';

describe('Federations: store', () => {
	let dispatch, getState;
	const projectId = 'projectId';

	beforeEach(() => {
		({ dispatch, getState } = createTestStore());
		dispatch(ProjectsActions.setCurrentProject(projectId));
	});

	const createAndAddFederationToStore = (federationOverrides = {}) => {
		const mockFederation = federationMockFactory(federationOverrides);
		dispatch(FederationsActions.fetchFederationsSuccess(projectId, [mockFederation]));
		return mockFederation;
	};

	it('should create a federation successfully', () => {
		createAndAddFederationToStore();
		const mockFederation = federationMockFactory();
		dispatch(FederationsActions.createFederationSuccess(projectId, prepareMockNewFederation(mockFederation), mockFederation._id));
		const federationIsIncluded = selectFederationById(getState(), mockFederation._id);
		expect(federationIsIncluded).toBeTruthy();
	});

	it('should fetch federations successfully', () => {
		const federationsBeforeFetch = selectFederations(getState());
		expect(federationsBeforeFetch).toEqual([]);
		const mockFederations = times(5, () => federationMockFactory());
		dispatch(FederationsActions.fetchFederationsSuccess(projectId, mockFederations));
		const federationsAfterFetch = selectFederations(getState());
		expect(federationsAfterFetch).toEqual(mockFederations);
	});

	it('should set a federation as favourite', () => {
		const mockFederation = createAndAddFederationToStore({ isFavourite: false });
		let favouriteFederations = selectFavouriteFederations(getState());
		expect(favouriteFederations).toEqual([]);
		const { _id: federationId, isFavourite } = mockFederation;
		dispatch(FederationsActions.setFavouriteSuccess(projectId, federationId, !isFavourite));
		favouriteFederations = selectFavouriteFederations(getState());
		expect(favouriteFederations).toEqual([{ ...mockFederation, isFavourite: true }]);
	});

	it('should fetch a federation\'s stats', () => {
		const mockFederation = createAndAddFederationToStore();
		const stats = prepareMockStats();
		dispatch(FederationsActions.fetchFederationStatsSuccess(projectId, mockFederation._id, stats));
		const federationFromState = selectFederationById(getState(), mockFederation._id);
		expect(federationFromState.code).toEqual(stats.code);
		expect(federationFromState.lastUpdated).toEqual(new Date(stats.lastUpdated));
		expect(federationFromState.status).toEqual(stats.status);
		expect(federationFromState.category).toEqual(stats.category);
	});

	it('should fetch a federation\'s views', () => {
		const { _id: federationId } = createAndAddFederationToStore();
		const mockViews = prepareMockViews();
		dispatch(FederationsActions.fetchFederationViewsSuccess(projectId, federationId, mockViews));
		const viewsFromState = selectFederationById(getState(), federationId).views;
		expect(viewsFromState).toEqual(mockViews);
	});

	it('should fetch a federation\'s settings', () => {
		const { _id: federationId } = createAndAddFederationToStore();
		const mockSettings = prepareMockSettingsReply(federationMockFactory());
		dispatch(FederationsActions.fetchFederationSettingsSuccess(projectId, federationId, mockSettings));
		const federationFromState = selectFederationById(getState(), federationId);
		expect(federationFromState.surveyPoint).toEqual(mockSettings.surveyPoint);
		expect(federationFromState.angleFromNorth).toEqual(mockSettings.angleFromNorth);
		expect(federationFromState.name).toEqual(mockSettings.name);
		expect(federationFromState.code).toEqual(mockSettings.code);
	});

	it('should update a federation\'s settings', () => {
		const { _id: federationId } = createAndAddFederationToStore();
		const mockSettings = prepareMockSettingsReply(federationMockFactory());
		dispatch(FederationsActions.updateFederationSettingsSuccess(projectId, federationId, mockSettings));
		const federationFromState = selectFederationById(getState(), federationId);
		expect(federationFromState.surveyPoint).toEqual(mockSettings.surveyPoint);
	});

	it('should delete a federation', () => {
		const mockFederation = createAndAddFederationToStore();
		dispatch(FederationsActions.deleteFederationSuccess(projectId, mockFederation._id));
		const federations = selectFederations(getState());
		expect(federations).toEqual([]);
	});

	it('should update a federation\'s containers', () => {
		const { _id: federationId } = createAndAddFederationToStore();
		const newContainers = prepareMockContainers();
		dispatch(FederationsActions.updateFederationContainersSuccess(projectId, federationId, newContainers));
		const containerIds = selectFederations(getState())[0].containers;
		expect(containerIds).toEqual(newContainers);
	});

	it('should update a federation', () => {
		const { _id: federationId } = createAndAddFederationToStore();
		const { _id, ...federationUpdate } = federationMockFactory();
		dispatch(FederationsActions.updateFederationSuccess(projectId, federationId, federationUpdate));
		const federationFromState = selectFederationById(getState(), federationId);
		expect(federationFromState).toEqual({ _id: federationId, ...federationUpdate });
	});

	// Selectors
	it('should say whether state is pending', () => {
		expect(selectIsListPending(getState())).toBeTruthy();
		const { _id: federationId } = createAndAddFederationToStore({ hasStatsPending: true });
		expect(selectIsListPending(getState())).toBeFalsy();
		expect(selectAreStatsPending(getState())).toBeTruthy();
		dispatch(FederationsActions.updateFederationSuccess(projectId, federationId, { hasStatsPending: false }));
		expect(selectAreStatsPending(getState())).toBeFalsy();
	});

	it('should give a list of container objects used in a federation', () => {
		const { _id: federationId } = createAndAddFederationToStore();
		const newContainers = times(3, () => containerMockFactory());
		dispatch(ContainersActions.fetchContainersSuccess(projectId, newContainers));
		const newContainerIds = newContainers.map((c) => c._id);
		dispatch(FederationsActions.updateFederationContainersSuccess(projectId, federationId, newContainerIds));
		const containersFromState = selectContainersByFederationId(getState(), federationId);
		expect(containersFromState).toEqual(newContainers);
	});

	describe('Federation permissions:', () => {
		const CreateFederationWithRole = (role) => {
			const newFederation = createAndAddFederationToStore({ role });
			const hasCollaboratorAccess = selectHasCollaboratorAccess(getState(), newFederation._id);
			const hasCommenterAccess = selectHasCommenterAccess(getState(), newFederation._id);

			return { hasCollaboratorAccess, hasCommenterAccess }
		}

		it('should return Project Admins access rights', () => {
			const { hasCollaboratorAccess, hasCommenterAccess } = CreateFederationWithRole(Role.ADMIN)
			expect(hasCollaboratorAccess).toBeTruthy();
			expect(hasCommenterAccess).toBeTruthy();
		});
		it('should return Collaborators access rights', () => {
			const { hasCollaboratorAccess, hasCommenterAccess } = CreateFederationWithRole(Role.COLLABORATOR)
			expect(hasCollaboratorAccess).toBeTruthy();
			expect(hasCommenterAccess).toBeTruthy();
		});
		it('should return Commenters access rights', () => {
			const { hasCollaboratorAccess, hasCommenterAccess } = CreateFederationWithRole(Role.COMMENTER)
			expect(hasCollaboratorAccess).toBeFalsy();
			expect(hasCommenterAccess).toBeTruthy();
		});
		it('should return Viewers access rights', () => {
			const { hasCollaboratorAccess, hasCommenterAccess } = CreateFederationWithRole(Role.VIEWER)
			expect(hasCollaboratorAccess).toBeFalsy();
			expect(hasCommenterAccess).toBeFalsy();
		});
	});
});
