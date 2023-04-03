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
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DueDateWithLabel } from '@controls/dueDate/dueDateWithLabel/dueDateWithLabel.component';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
	title: 'Buttons/DueDate',
	component: DueDateWithLabel,
	// More on argTypes: https://storybook.js.org/docs/react/api/argtypes

	argTypes: {
		value: {
			description: 'The due date',
			control: {
				type: 'date',
			},
		},
		disabled: {
			type: 'boolean',
		},
	},
} as ComponentMeta<typeof DueDateWithLabel>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof DueDateWithLabel> = (args) => (
	<LocalizationProvider dateAdapter={AdapterDayjs}>
		<DueDateWithLabel {...args} />
	</LocalizationProvider>
);

export const Overdue = Template.bind({});
Overdue.args = {
	value: 1665572857000,
};

export const Due = Template.bind({});
Due.args = {
	value: 2020202020202,
};

export const Unset = Template.bind({});

export const UnsetDisabled = Template.bind({});
UnsetDisabled.args = {
	disabled: true,
};
