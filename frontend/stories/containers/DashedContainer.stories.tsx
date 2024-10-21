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
import { DashedContainer } from '@controls/dashedContainer/dashedContainer.component';
import { Button as ControlsButton } from '@controls/button';

export default {
	title: 'Containers/DashedContainer',
	component: DashedContainer,
	argTypes: {
		$borderRadius: {
			type: 'number',
		},
		$strokeColor: {
			description: 'The colour should be an HEX value of 6 digits (excluding the hash)',
			type: 'string',
		},
		$strokeWidth: {
			type: 'number',
		},
		$dashSize: {
			type: 'number',
		},
		$gapSize: {
			description: 'The space between one dash and the next one',
			type: 'number',
		},
		$zeroPadding: {
			description: 'If true, the dashed border can be overllaped by the content',
			type: 'boolean',
		},
		children: {
			description: 'The text, button, or component to contain inside the container',
			type: 'string',
		},
	},
	args: {
		children: 'Dashed container\'s content',
	},
	parameters: { controls: { exclude: ['className'] } },
} as Meta<typeof DashedContainer>;

type Story = StoryObj<typeof DashedContainer>;

export const NoRadius: Story = {
	args: {
		$borderRadius: 0,
		$strokeColor: '#000000',
		children: 'this is an example of a dashed container with 0 border radius',
	},
};

export const BigRadius: Story = {
	args: {
		$borderRadius: 20,
		$strokeColor: '#fe27d8',
		children: 'this is an example of a dashed container with big border radius',
	},
};

export const Gapped: Story = {
	args: {
		$dashSize: 10,
		$gapSize: 10,
		children: `
			this is an example of a dashed container with longer dashes and more gap in between.
			the content has not padding
		`,
	},
};

export const Button: Story = {
	args: {
		$strokeColor: '#09c1d4',
		$strokeWidth: 6,
		$zeroPadding: true,
		children: <ControlsButton variant="text">This is an example with a button</ControlsButton>,
	},
};
