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
	reducer as revisionsReducer,
	RevisionsActions,
} from '@/v5/store/revisions/revisions.redux';
import { times } from 'lodash';
import { revisionsMockFactory } from './revisions.fixtures';

describe('Revisions: redux', () => {
	const containerId = 'containerId';
	const mockRevisions = times(5, () => revisionsMockFactory());
	const defaultState = {
		...INITIAL_STATE,
		revisions: {
			[containerId]: mockRevisions
		}
	};

	describe('on setIsPending action', () => {
		it('should set true to pending state for revisions', () => {
			const resultState = revisionsReducer(
					defaultState,
					RevisionsActions.setIsPending(containerId, true)
			);

			expect(resultState.isPending[containerId]).toEqual(true);
		});
	});

	describe('on fetchSuccess action', () => {
		it('should set revisions for given container', () => {
			const mockRevisions = times(5, () => revisionsMockFactory());
			const mockRevisionsLength = mockRevisions.length;
			const defaultState = {
				...INITIAL_STATE,
				revisions: {
					[containerId]: {}
				}
			};
			const resultState = revisionsReducer(
					defaultState,
					RevisionsActions.fetchSuccess(containerId, mockRevisions)
			);
			const resultRevisions = resultState.revisions[containerId];

			expect(resultRevisions.length).toEqual(mockRevisionsLength);
		});
	});
})
