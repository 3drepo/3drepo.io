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
import { SuccessMessage } from '@controls/successMessage/successMessage.component';

export default {
	title: 'Outputs/SuccessMessage',
	component: SuccessMessage,
	argTypes: {
		children: {
			description: 'The text to display',
			defaultValue: 'Success message\'s content',
			type: 'string',
		},
	},
	parameters: { controls: { exclude: ['className'] } },
} as ComponentMeta<typeof SuccessMessage>;

const Template: ComponentStory<typeof SuccessMessage> = ({ children, ...args }) => (
	<SuccessMessage {...args}>{children}</SuccessMessage>
);

export const SingleLineMessage = Template.bind({});
SingleLineMessage.args = {
	children: 'This is the success message',
};

export const MultiLineMessage = Template.bind({});
MultiLineMessage.args = {
	children: (
		<div>
			This is the success message
			<br />
			over 2 lines
		</div>
	),
};
