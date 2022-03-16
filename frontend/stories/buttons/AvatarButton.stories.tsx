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
import { Avatar as Button } from '@controls/avatar/';
import { ComponentProps } from 'react';

export default {
	title: 'Buttons/AvatarButton',
	component: Button,
} as ComponentMeta<typeof Button>;

type Props = ComponentProps<typeof Button>;

const Template: ComponentStory<typeof Button> = (args) =>
	<Button {...args} />;

export const AvatarWithInitials = Template.bind({});
AvatarWithInitials.args = {
	user: {
		firstName: 'Json',
		lastName: 'Vorhees',
		hasAvatar: false,
		avatarUrl: '',
	},
	isButton: false,
} as Props;

export const AvatarWithInitialsBigAndHoverStates = Template.bind({});
AvatarWithInitialsBigAndHoverStates.args = {
	user: {
		firstName: 'Json',
		lastName: 'Vorhees',
		hasAvatar: false,
		avatarUrl: '',
	},
	largeIcon: true,
	isButton: true,
} as Props;

export const AvatarWithImage = Template.bind({});
AvatarWithImage.args = {
	user: {
		firstName: 'Json',
		lastName: 'Vorhees',
		hasAvatar: true,
		avatarUrl: 'https://i.pinimg.com/170x/26/5c/1c/265c1cc710304eb15607e18c6f591c85.jpg',
	},
} as Props;
