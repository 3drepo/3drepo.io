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
import { FormCheckbox, FormCheckboxProps } from '@controls/formCheckbox/formCheckbox.component';
import { useForm } from 'react-hook-form';
import { FormContainer, FormData } from './FormInput.styles';
import { DashboardViewerLayout } from '@components/dashboard/dashboardViewerLayout/dashboardViewerLayout.component';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { theme as dashboardTheme } from '@/v5/ui/themes/theme';
import { theme as viewerTheme } from '@/v5/ui/routes/viewer/theme';
import { bindWithTheme } from 'stories/theme/helper';

interface IFormCheckboxInput {
	checkbox: boolean;
}

export default {
	title: 'Inputs/FormCheckbox',
	argTypes: {
		label: {
			type: 'string',
		},
		defaultValue: {
			type: 'boolean',
		},
		viewerTheme: {
			type: 'boolean'
		},
	},
	component: FormCheckbox,
	parameters: { controls: { exclude: ['control', 'formError'] } },
} as ComponentMeta<typeof FormCheckbox>;

const Controlled: ComponentStory<typeof FormCheckbox> = (args: FormCheckboxProps & { viewerTheme: boolean }) => {
	const { control, watch } = useForm({ mode: 'onChange' });

	return (
		<FormContainer>
			<FormCheckbox
				name="checkbox"
				control={control}
				{...args}
			/>
			<FormData>
				<span>Value:</span>
				<span>{watch('checkbox')}</span>
			</FormData>
		</FormContainer>
	);
};

export const ControlledFormCheckbox = Controlled.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
ControlledFormCheckbox.args = {
	label: 'Controlled Checkbox input',
};