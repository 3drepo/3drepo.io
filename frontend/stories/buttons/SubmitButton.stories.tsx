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
import { SubmitButton } from '@controls/submitButton';

import LoginIcon from '@assets/icons/outlined/login-outlined.svg';
import EmailIcon from '@assets/icons/filled/email-filled.svg';
import LockIcon from '@assets/icons/outlined/lock-outlined.svg';
import AddIcon from '@assets/icons/filled/add_circle-filled.svg';
import SignupIcon from '@assets/icons/outlined/add_user-outlined.svg';

const Icons = {
	loginIcon: <LoginIcon />,
	emailIcon: <EmailIcon />,
	lockIcon: <LockIcon />,
	addIcon: <AddIcon />,
	signupIcon: <SignupIcon />,
	none: <></>,
};

export default {
	title: 'Buttons/SubmitButton',
	component: SubmitButton,
	argTypes: {
		variant: {
			description: 'Variant of the button',
			options: ['contained', 'outlined', 'text', 'label'],
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
					signupIcon: 'Signup',
					none: 'None',
				},
			},
		},
		children: {
			description: 'The text that appears on the button',
			type: 'string',
		},
	},
	args: {
		children: 'Submit',
	},
} as Meta<typeof SubmitButton>;

type Story = StoryObj<typeof SubmitButton>;

export const Primary: Story = {
	args: {
		variant: 'contained',
		color: 'primary',
		startIcon: <LoginIcon />,
	},
};

export const Secondary: Story = {
	args: {
		variant: 'outlined',
		color: 'secondary',
		startIcon: <EmailIcon />,
	},
};
