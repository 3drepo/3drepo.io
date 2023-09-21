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
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DueDateWithLabel } from '@controls/dueDate/dueDateWithLabel/dueDateWithLabel.component';

export default {
	title: 'Buttons/DueDate',
	component: DueDateWithLabel,
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
	decorators: [
		(Story) => (
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<Story />
			</LocalizationProvider>
		),
	],
	parameters: { controls: ['onBlur'] },
} as Meta<typeof DueDateWithLabel>;

type Story = StoryObj<typeof DueDateWithLabel>;

export const Overdue: Story = { args: { value: 1665572857000 } };
export const Due: Story = { args: { value: 2020202020202 } };
export const Unset: Story = {};
export const UnsetDisabled: Story = { args: { disabled: true } };
