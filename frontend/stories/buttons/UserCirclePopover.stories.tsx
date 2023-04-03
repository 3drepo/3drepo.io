/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { UserCirclePopover } from '@components/shared/userCirclePopover/userCirclePopover.component';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ComponentProps } from 'react';

export default {
	title: 'Buttons/UserCirclePopover',
	component: UserCirclePopover,
	argTypes: {
		job: {
			description: 'Variant of the button',
			control: { type: 'text' },
		},
	},
} as ComponentMeta<typeof UserCirclePopover>;

type Props = ComponentProps<typeof UserCirclePopover>;

const Template: ComponentStory<typeof UserCirclePopover> = ({ user }) => (
	<UserCirclePopover user={user} />
);

const basicUser = {
	user: 'user',
	firstName: 'firstName',
	lastName: 'lastName',
	company: 'company',
	job: 'job',
	email: 'email',
	hasAvatar: true,
	avatarUrl: 'https://i.pinimg.com/170x/26/5c/1c/265c1cc710304eb15607e18c6f591c85.jpg',
};

export const UserCirclePopoverWithAvatar = Template.bind({});
UserCirclePopoverWithAvatar.args = {
	user: basicUser,
} as Props;

export const UserCirclePopoverWithoutAvatar = Template.bind({});
UserCirclePopoverWithoutAvatar.args = {
	user: {
		...basicUser,
		hasAvatar: false,
	},
} as Props;
