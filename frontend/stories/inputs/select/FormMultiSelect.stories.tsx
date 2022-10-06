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
import { FormMultiSelect } from '@controls/formMultiSelect/formMultiSelect.component';
import { MultiSelectMenuItem } from '@controls/formMultiSelect/multiSelectMenuItem/multiSelectMenuItem.component';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useForm } from 'react-hook-form';
import ClearIcon from '@assets/icons/controls/clear_circle.svg';
import ChevronIcon from '@assets/icons/chevron.svg';
import CalendarIcon from '@assets/icons/outlined/calendar-outlined.svg';
import PrintIcon from '@assets/icons/print.svg';
import styled from 'styled-components';
import { FormContainer } from '../FormInput.styles';

export default {
	title: 'Inputs/Select/FormMultiSelect',
	argTypes: {
		label: {
			type: 'string',
		},
		defaultValue: {
			type: 'string',
		},
		disabled: {
			type: 'boolean',
		},
	},
	component: FormMultiSelect,
	parameters: { controls: { exclude: ['control'] } },
} as ComponentMeta<typeof FormMultiSelect>;

const IconContainer = styled.div`
	margin-right: 5px;
	svg {
		width: 15px;
	}
`;

const Controlled: ComponentStory<typeof FormMultiSelect> = (args) => {
	const { control } = useForm({ mode: 'onChange' });

	return (
		<FormContainer>
			<FormMultiSelect
				name="multiselect"
				control={control}
				renderValue={(selectedItem: any[]) => (
					selectedItem.map((item, index) => (
						<>
							<span>{index > 0 ? ', ' : ''}</span>
							<div style={{ display: 'inline-flex' }}>
								{item.children[0]}
							</div>
							<span>{item.children[1]}</span>
						</>
					))
				)}
				{...args}
			>
				<MultiSelectMenuItem value={1} key={1}>
					<IconContainer>
						<CalendarIcon />
					</IconContainer>
					calendar icon
				</MultiSelectMenuItem>
				<MultiSelectMenuItem value={2} key={2}>
					<IconContainer>
						<ClearIcon />
					</IconContainer>
					clear icon
				</MultiSelectMenuItem>
				<MultiSelectMenuItem value={3} key={3}>
					<IconContainer>
						<ChevronIcon />
					</IconContainer>
					chevron icon
				</MultiSelectMenuItem>
				<MultiSelectMenuItem value={4} key={4}>
					<IconContainer>
						<PrintIcon />
					</IconContainer>
					print icon
				</MultiSelectMenuItem>
			</FormMultiSelect>
		</FormContainer>
	);
};

export const ControlledFormSelect = Controlled.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
ControlledFormSelect.args = {
	label: 'Controlled Multi Select input',
};
