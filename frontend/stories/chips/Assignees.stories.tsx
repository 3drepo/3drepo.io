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

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Assignees } from '@controls/assignees/assignees.component';
import { MemoryRouter, Route } from 'react-router-dom';
import { times } from 'lodash';
import faker from 'faker';
import { JOBS_LIST } from '@/v5/store/users/user.types';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import reducers from '@/v5/store/reducers';

const createTestStore = () => createStore(combineReducers(reducers));
const store = createTestStore();

export default {
	title: 'Chips/Assignees',
	component: Assignees,
	decorators: [
		(Story) => (
			<Provider store={store as any}>
				<MemoryRouter initialEntries={['/Teamspace']}>
					<Route
						component={(routerProps) => <Story {...routerProps} />}
						path="/:teamspace"
					/>
				</MemoryRouter>
			</Provider>
		),
	],
	argTypes: {
		userCount: {
			description: 'The number of users assigned to this',
			type: 'number',
		},
	},
} as ComponentMeta<typeof Assignees>;

type Props = {
	userCount: number;
	max?: number;
};

const Template: ComponentStory<any> = ({ userCount, ...args }: Props) => {
	const assignees = times(userCount, () => faker.random.arrayElement(JOBS_LIST.map((j) => j.titleLong)));
	return (
		<Assignees {...args} assignees={assignees} />
	);
};

export const SingleAssignedUser = Template.bind({});
SingleAssignedUser.args = {
	userCount: 1,
} as Props;

export const Unassigned = Template.bind({});
Unassigned.args = {
	userCount: 0,
} as Props;

export const OverflowingAssignees = Template.bind({});
OverflowingAssignees.args = {
	max: 6,
	userCount: 10,
} as Props;

export const UnlimitedAssignees = Template.bind({});
UnlimitedAssignees.args = {
	userCount: 10,
} as Props;
