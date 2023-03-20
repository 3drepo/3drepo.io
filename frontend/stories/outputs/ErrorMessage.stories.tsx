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
		title: {
			description: 'The title to display',
			defaultValue: 'Error message\'s title',
			type: 'string',
		},
		children: {
			description: 'The body of the error',
			defaultValue: 'Error message\'s content',
			type: 'string',
		},
	},
	parameters: { controls: { exclude: ['className'] } },
} as ComponentMeta<typeof ErrorMessage>;

const Template: ComponentStory<typeof ErrorMessage> = ({ children, ...args }) => (
	<ErrorMessage {...args}>{children}</ErrorMessage>
);

export const TitleOnlyError = Template.bind({});
TitleOnlyError.args = {
	title: 'Error',
};

export const ChildrenOnlyError = Template.bind({});
ChildrenOnlyError.args = {
	children: 'Error',
};

export const TitleAndChildrenError = Template.bind({});
TitleAndChildrenError.args = {
	title: 'Error with title',
	children: 'Note that, when I break, the icon stays aligned with the top line.',
};
