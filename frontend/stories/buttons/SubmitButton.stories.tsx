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
import { SubmitButton as Button } from '@controls/submitButton';

import LoginIcon from '@assets/icons/login.svg';
import EmailIcon from '@assets/icons/email.svg';
import LockIcon from '@assets/icons/lock.svg';
import AddIcon from '@assets/icons/add_circle.svg';

const Icons = {
	loginIcon: <LoginIcon />,
	emailIcon: <EmailIcon />,
	lockIcon: <LockIcon />,
	addIcon: <AddIcon />,
	none: <></>,
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
	title: 'Buttons/SubmitButton',
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
		startIcon: {
			options: Object.keys(Icons), // An array of serializable values
			mapping: Icons, // Maps serializable option values to complex arg values
			control: {
				type: 'select',
				labels: {
					loginIcon: 'Login',
					emailIcon: 'Email',
					lockIcon: 'Lock',
					addIcon: 'Add Circle',
					none: 'None',
				},
			},
		},
		children: {
			description: 'The text that appears on the button',
			type: 'string',
			defaultValue: 'Submit',
		},
	},
} as ComponentMeta<typeof Button>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Button> = (args) => {
	const { children } = args;
	return (
		<Button {...args}>{children}</Button>
	);
};

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
	variant: 'contained',
	color: 'primary',
	startIcon: <LoginIcon />,
};

export const Secondary = Template.bind({});
Secondary.args = {
	variant: 'outlined',
	color: 'secondary',
	startIcon: <EmailIcon />,
};
