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
import { ViewerActions } from '@/v5/store/viewer/viewer.redux';
import { selectIsFetching } from '@/v5/store/viewer/viewer.selectors';
import { createTestStore } from '../test.helpers';

describe('Viewer: redux', () => {
	const teamspace = 'myteamspace';
	const projectId = 'myprojectid';
	
	let dispatch, getState;

	beforeEach(() => {
		({ dispatch, getState } = createTestStore());
	});

	it('should change the state of fetching to true when setFetching(true) hass been dispatched' , async () => {
		dispatch(ViewerActions.setFetching(true));
		const fetching = selectIsFetching(getState());
		expect(fetching).toBeTruthy();
	});

	it('should change the state of fetching to false when setFetching(true) has been dispatched' , async () => {
		dispatch(ViewerActions.setFetching(true));
		dispatch(ViewerActions.setFetching(false));
		const fetching = selectIsFetching(getState());
		expect(fetching).toBeFalsy();
	});
});
