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
import { StoryObj, Meta } from '@storybook/react';
import { SuccessMessage } from '@controls/successMessage/successMessage.component';

const meta: Meta<typeof SuccessMessage> = {
	title: 'Outputs/SuccessMessage',
	component: SuccessMessage,
	argTypes: {
		children: {
			description: 'The text to display',
			type: 'string',
		},
	},
	parameters: { controls: { exclude: ['className'] } },
};
export default meta;

type Story = StoryObj<typeof SuccessMessage>;

export const SingleLineMessage: Story = {
	args: {
		children: 'This is the success message',
	},
};

export const MultiLineMessage: Story = {
	args: {
		children: (
			<div>
				This is the success message
				<br />
				over 2 lines
			</div>
		),
	},
};
