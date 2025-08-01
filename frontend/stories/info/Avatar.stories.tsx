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
import { Avatar } from '@controls/avatar/avatar.component';
import { Meta, StoryObj } from '@storybook/react';

const defaultUser = {
	firstName: 'Json',
	lastName: 'Vorhees',
	hasAvatar: false,
	avatarUrl: '',
	user: null,
};

const meta: Meta<typeof Avatar> = {
	title: 'Info/Avatar',
	component: Avatar,
	parameters: { controls: { exclude: ['onClick', 'className'] } },
	args: {
		user: defaultUser,
	},
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const AvatarWithInitials: Story = { args: { isButton: false } };

export const AvatarWithInitialsHoverStates: Story = { args: { isButton: true } };

export const AvatarWithInitialsLargeSizeAndHoverStates: Story = {
	args: {
		size: 'large',
		isButton: true,
	},
};

export const AvatarWithImage: Story = {
	args: {
		user: {
			...defaultUser,
			hasAvatar: true,
			avatarUrl: 'https://i.pinimg.com/170x/26/5c/1c/265c1cc710304eb15607e18c6f591c85.jpg',
		},
	},
};
