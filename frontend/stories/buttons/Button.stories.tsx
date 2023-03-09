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
import { Button } from '@controls/button';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
	title: 'Buttons/Button',
	component: Button,
	// More on argTypes: https://storybook.js.org/docs/react/api/argtypes

	argTypes: {
		variant: {
			description: 'Variant of the button',
			options: ['contained', 'outlined', 'text'],
			control: { type: 'select' },
		},
		/**
		 * The color of the component. It supports those theme colors that make sense for this component.
		 */
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
		isPending: {
			type: 'boolean',
		},
		disabled: {
			type: 'boolean',
		},
		errorButton: {
			type: 'boolean',
		},
	},
} as ComponentMeta<typeof Button>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Button> = (args) => <Button {...args}>Controls Button</Button>;

// More on args: https://storybook.js.org/docs/react/writing-stories/args
export const Contained = Template.bind({});
Contained.args = {
	variant: 'contained',
	color: 'secondary',
};

export const Outlined = Template.bind({});
Outlined.args = {
	variant: 'outlined',
	color: 'secondary',
};

export const Text = Template.bind({});
Text.args = {
	variant: 'text',
	color: 'primary',
};

export const Error = Template.bind({});
Error.args = {
	errorButton: true,
};
