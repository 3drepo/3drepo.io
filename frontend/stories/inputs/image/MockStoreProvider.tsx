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
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import v5Reducers from '@/v5/store/reducers';

export const MockStoreProvider = ({ isAdmin = true, children }) => {
	const initialState: any = {
		projects: {
			projectsByTeamspace: {
				localuser1: [
					{
						_id: '4daac4b0-507b-11ed-9c97-893b6bde0ecd',
						name: 'teamspaces',
						isAdmin,
					},
				],
			},
			currentProject: '4daac4b0-507b-11ed-9c97-893b6bde0ecd',
		},
		teamspaces2: {
			currentTeamspace: 'localuser1',
		},
	};
	const store = createStore(
		(state: any, action) => combineReducers({ ...v5Reducers })(state, action),
		initialState,
	);
	return (
		<Provider store={store as any}>
			{children}
		</Provider>
	);
};
