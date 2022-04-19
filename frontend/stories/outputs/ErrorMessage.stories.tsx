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
import { ErrorMessage } from '@controls/errorMessage/errorMessage.component';

export default {
	title: 'Outputs/ErrorMessage',
	component: ErrorMessage,
	argTypes: {
		children: {
			description: 'The text or componhat will display',
			defaultValue: 'Error message\'s content',
		},
	},
} as ComponentMeta<typeof ErrorMessage>;

const Template: ComponentStory<typeof ErrorMessage> = ({ children, ...args }) => (
	<ErrorMessage {...args}>{children}</ErrorMessage>
);

export const BreakLineError = Template.bind({});
BreakLineError.args = {
	children: (
		<div>
			This is the error message.
			<br />
			Note that, when I break, the icon stays aligned with the top line.
		</div>
	),
};
