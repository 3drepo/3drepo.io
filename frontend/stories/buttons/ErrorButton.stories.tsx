/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { ErrorButton } from '@controls/button/errorButton/errorButton.styles';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
	title: 'Buttons/ErrorButton',
	component: ErrorButton,
	// More on argTypes: https://storybook.js.org/docs/react/api/argtypes
	argTypes: {
		dark: {
			type: 'boolean',
		},
	},
} as ComponentMeta<typeof ErrorButton>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ErrorButton> = (args) => (
	<div style={{ background: '#F2F6FC' }}>
		<ErrorButton {...args}>Error Button</ErrorButton>
	</div>
);
// More on args: https://storybook.js.org/docs/react/writing-stories/args
export const Dark = Template.bind({});
Dark.args = { dark: true };

export const Light = Template.bind({});
Light.args = { dark: false };
