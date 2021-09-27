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
import { throwError } from 'redux-saga-test-plan/providers';

import * as ProjectsSaga from '@/v5/store/projects/projects.sagas';
import { ProjectsActions } from '@/v5/store/projects/projects.redux';

describe('Teamspaces: sagas', () => {
	describe('fetch', () => {
		it('should fetch projects data and dispatch FETCH_SUCCESS', () => {
			jest.mock('@/v5/services/api', () => ({
				fetchProjects: () => Promise.resolve(true),
			}));

			expectSaga(ProjectsSaga.default)
				.dispatch(ProjectsActions.fetch('teamspaceName'))
				.put(ProjectsActions.fetchSuccess('teamspaceName', []))
				.silentRun();
		});

		it('should handle projects api error and dispatch FETCH_FAILURE', () => {
			jest.mock('@/v5/services/api', () => ({
				fetchProjects: () => throwError(new Error('error')),
			}));

			expectSaga(ProjectsSaga.default)
				.dispatch(ProjectsActions.fetch('teamspaceName'))
				.put(ProjectsActions.fetchFailure())
				.silentRun();
		});
	});
});
