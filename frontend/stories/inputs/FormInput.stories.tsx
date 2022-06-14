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
import { FormFileInput } from '@controls/formFileInput/formFileInput.component';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useForm } from 'react-hook-form';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
	title: 'Inputs/FormFileInput',
	argTypes: {
		label: {
			type: 'string',
		},
		buttonProps: {
			variant: {
				description: 'Variant of the button',
				options: ['contained', 'outlined'],
				control: { type: 'select' },
			},
			color: {
				options: [
					'primary',
					'secondary',
					'error',
				],
				control: { type: 'select' },
			},
		},
		formError: {
			message: {
				type: 'string',
			},
		},
	},
	component: FormFileInput,
	parameters: { controls: { exclude: ['className'] } },
} as ComponentMeta<typeof FormFileInput>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof FormFileInput> = (args) => {
	const {
		control,
	} = useForm<{ fileAvatar: File }>({
		mode: 'onChange',
	});
	return <FormFileInput control={control} name="file" {...args} />;
};

export const ContainedPrimaryButton = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
ContainedPrimaryButton.args = {
	label: 'Contained button',
	buttonProps: {
		color: 'primary',
		variant: 'contained',
	},
};

export const OutlinedSecondaryButtonWithError = Template.bind({});
OutlinedSecondaryButtonWithError.args = {
	label: 'Outlined button',
	buttonProps: {
		color: 'secondary',
		variant: 'outlined',
	},
	formError: {
		message: 'Error message',
	},
};
