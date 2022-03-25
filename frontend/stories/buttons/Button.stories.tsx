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
			options: ['contained', 'outlined', 'text', 'label', 'label-outlined'],
			control: { type: 'select' },
		},

		/**
 * The color of the component. It supports those theme colors that make sense for this component.
 */
		color: {
			options: ['inherit',
				'primary', 'secondary',
				'success',
				'error',
				'info',
				'warning',
				'text'],
			control: { type: 'select' },
		},
		isPending: {
			type: 'boolean',
		},
		disabled: {
			type: 'boolean',
		},
	},
} as ComponentMeta<typeof Button>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Button> = (args) => <Button {...args}>Material ui button</Button>;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
	variant: 'outlined',
	color: 'primary',
};

export const Secondary = Template.bind({});
Secondary.args = {
	variant: 'outlined',
	color: 'secondary',
};

export const Label = Template.bind({});
Label.args = {
	variant: 'label',
	color: 'primary',
};

export const LabelOutined = Template.bind({});
LabelOutined.args = {
	variant: 'label-outlined',
	color: 'primary',
};
