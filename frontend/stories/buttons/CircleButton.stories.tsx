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
import { Meta, StoryObj } from '@storybook/react';
import { CircleButton } from '@controls/circleButton';
import NotificationsIcon from '@assets/icons/outlined/bell-outlined.svg';

const meta: Meta<typeof CircleButton> = {
	title: 'Buttons/CircleButton',
	component: CircleButton,
	argTypes: {
		variant: {
			description: 'Variant of the button',
			options: ['primary', 'secondary', 'viewer'],
			control: { type: 'select' },
		},
	},
	args: {
		children: <NotificationsIcon />,
	},
	parameters: { controls: { exclude: ['onClick', 'children'] } },
};
export default meta;

type Story = StoryObj<typeof CircleButton>;

export const NotificationsPrimary: Story = { args: { variant: 'primary' } };
export const NotificationsSecondary: Story = { args: { variant: 'secondary' } };
export const NotificationsViewer: Story = { args: { variant: 'viewer' } };
