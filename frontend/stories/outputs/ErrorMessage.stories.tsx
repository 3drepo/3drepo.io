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
import { ErrorMessage } from '@controls/errorMessage/errorMessage.component';

export default {
	title: 'Outputs/ErrorMessage',
	component: ErrorMessage,
	argTypes: {
		title: {
			description: 'The title to display',
			type: 'string',
		},
		children: {
			description: 'The body of the error',
			type: 'string',
		},
	},
	args: {
		title: 'Error message\'s title',
		children: 'Error message\'s content',
	},
	parameters: { controls: { exclude: ['className'] } },
} as Meta<typeof ErrorMessage>;

type Story = StoryObj<typeof ErrorMessage>;

export const TitleOnlyError: Story = {
	args: {
		title: 'Error',
	},
};

export const ChildrenOnlyError: Story = {
	args: {
		children: 'Error',
	},
};

export const TitleAndChildrenError: Story = {
	args: {
		title: 'Error with title',
		children: 'Note that, when I break, the icon stays aligned with the top line.',
	},
};
