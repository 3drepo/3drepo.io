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

import {
	INITIAL_STATE,
	reducer as containersReducer,
	ContainersActions,
} from '@/v5/store/containers/containers.redux';
import { times } from 'lodash';
import { containerMockFactory, revisionsMockFactory } from '@/v5/store/containers/containers.fixtures';

describe('Containers: redux', () => {
	const projectId = 'projectId';
	const mockContainers = times(5, () => containerMockFactory({ isFavourite: false }));
	const defaultState = {
		...INITIAL_STATE,
		containers: {
			[projectId]: mockContainers
		}
	};

	describe('on setCurrentProject action', () => {
		it('should set project name as current', () => {
			const teamspaceName = 'teamspaceName';

			const resultState = containersReducer(defaultState, ContainersActions.setCurrentProject(teamspaceName));

			expect(resultState.currentProject).toEqual(teamspaceName);
		});
	});

	describe('on setRevisionsIsPending action', () => {
		it('should set true to pending state for container', () => {
			const resultState = containersReducer(
					defaultState,
					ContainersActions.setRevisionsIsPending(projectId, mockContainers[0]._id, true)
			);
			const resultContainers = resultState.containers[projectId];

			expect(resultContainers[0].isPending).toEqual(true);
		});
	});

	describe('on fetchRevisionsSuccess action', () => {
		it('should set revisions to pending state for container', () => {
			const mockContainers = times(5, () => containerMockFactory({ revisions: [] }));
			const mockRevisions = times(5, () => revisionsMockFactory());
			const mockRevisionsLength = mockRevisions.length;
			const defaultState = {
				...INITIAL_STATE,
				containers: {
					[projectId]: mockContainers
				}
			};
			const resultState = containersReducer(
					defaultState,
					ContainersActions.fetchRevisionsSuccess(projectId, mockContainers[0]._id, mockRevisions)
			);
			const resultContainers = resultState.containers[projectId];

			expect(resultContainers[0].revisions.length).toEqual(mockRevisionsLength);
		});
	});
})
