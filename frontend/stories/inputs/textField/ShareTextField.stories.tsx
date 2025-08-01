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
import { ShareTextField } from '@controls/shareTextField';
import { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ShareTextField> = {
	title: 'Inputs/ShareTextField',
	argTypes: {
		hideValue: {
			type: 'boolean',
		},
		disabled: {
			type: 'boolean',
		},
		variant: {
			options: ['filled', 'outlined'],
			control: { type: 'select' },
		},
	},
	component: ShareTextField,
	parameters: { controls: { exclude: ['className'] } },
};
export default meta;

type Story = StoryObj<typeof ShareTextField>;

export const Default: Story = {
	args: {
		label: 'Textfield label',
		value: 'https://3drepo.com/',
	},
};

export const HiddenValue: Story = {
	args: {
		label: 'Textfield label',
		value: 'https://3drepo.com/',
		hideValue: true,
	},
};

export const DisabledValue: Story = {
	args: {
		label: 'Textfield label',
		value: 'https://3drepo.com/',
		disabled: true,
	},
};
