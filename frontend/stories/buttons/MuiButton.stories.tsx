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
import { Button } from '@mui/material';

const meta: Meta<typeof Button> = {
	title: 'Buttons/MuiButton',
	component: Button,
	argTypes: {
		variant: {
			description: 'Variant of the button',
			options: ['contained', 'outlined', 'text'],
			control: { type: 'select' },
		},
		color: {
			options: [
				'inherit',
				'primary',
				'secondary',
				'success',
				'error',
				'info',
				'warning',
			],
			control: { type: 'select' },
		},
		disabled: {
			type: 'boolean',
		},
		isPending: {
			type: 'boolean',
		},
	},
	args: {
		children: 'Material ui button',
		variant: 'outlined',
	},
	parameters: {
		controls: { exclude: ['variant'] },
	},
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
	args: {
		color: 'primary',
	},
};

export const Secondary: Story = {
	args: {
		color: 'secondary',
	},
};
