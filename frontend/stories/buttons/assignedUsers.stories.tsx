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
import { AssignedUsers } from '@controls/assignedUsers/assignedUsers.component';
import { times } from 'lodash';
import faker from 'faker';

export default {
	title: 'Buttons/AssignedUsers',
	component: AssignedUsers,
	argTypes: {
		userCount: {
			description: 'The number of users assigned to this',
			type: 'number',
		},
	},
} as ComponentMeta<typeof AssignedUsers>;

type Props = {
	userCount: number;
	max?: number;
};

const mockUser = () => ({
	user: faker.random.word(),
	firstName: faker.name.firstName(),
	lastName: faker.name.lastName(),
	company: `${faker.random.word()} Inc.`,
	job: faker.random.arrayElement(['Admin', 'Architect', 'Client']),
	email: faker.internet.email(),
	hasAvatar: faker.datatype.boolean(),
	avatarUrl: faker.image.image(),
});

const Template: ComponentStory<any> = ({ userCount, ...args }: Props) => {
	const users = times(userCount, () => mockUser());
	return (
		<AssignedUsers {...args} users={users} />
	);
};

export const SingleAssignedUser = Template.bind({});
SingleAssignedUser.args = {
	userCount: 1,
} as Props;

export const OverflowingAssignedUsers = Template.bind({});
OverflowingAssignedUsers.args = {
	max: 6,
	userCount: 10,
} as Props;

export const UnlimitedAssignedUsers = Template.bind({});
UnlimitedAssignedUsers.args = {
	userCount: 10,
} as Props;
