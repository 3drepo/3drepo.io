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
import { FormSearchSingleSelect } from '@controls/formSingleSearchSelect/formSearchSingleSelect.component';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useForm } from 'react-hook-form';
import ClearIcon from '@assets/icons/controls/clear_circle.svg';
import ChevronIcon from '@assets/icons/chevron.svg';
import CalendarIcon from '@assets/icons/outlined/calendar-outlined.svg';
import PrintIcon from '@assets/icons/print.svg';
import styled from 'styled-components';
import { SearchSelectMenuItem } from '@controls/formSingleSearchSelect/searchSelectMenuItem.component';
import { FormContainer } from '../FormInput.styles';

export default {
	title: 'Inputs/Select/FormSearchSingleSelect',
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
	component: FormSearchSingleSelect,
	parameters: { controls: { exclude: ['control'] } },
} as ComponentMeta<typeof FormSearchSingleSelect>;

const IconContainer = styled.div`
	margin-right: 5px;
	svg {
		width: 15px;
	}
`;

const Controlled: ComponentStory<typeof FormSearchSingleSelect> = (args) => {
	const { control } = useForm({ mode: 'onChange' });

	return (
		<FormContainer>
			<FormSearchSingleSelect
				name="multiselect"
				control={control}
				renderValue={({ children }) => (
					<>
						<div style={{ display: 'inline-flex' }}>
							{children[0]}
						</div>
						<span>{children[1]}</span>
					</>
				)}
				{...args}
			>
				<SearchSelectMenuItem value={1} key={1}>
					<IconContainer>
						<CalendarIcon />
					</IconContainer>
					calendar icon
				</SearchSelectMenuItem>
				<SearchSelectMenuItem value={2} key={2}>
					<IconContainer>
						<ClearIcon />
					</IconContainer>
					clear icon
				</SearchSelectMenuItem>
				<SearchSelectMenuItem value={3} key={3}>
					<IconContainer>
						<ChevronIcon />
					</IconContainer>
					chevron icon
				</SearchSelectMenuItem>
				<SearchSelectMenuItem value={4} key={4}>
					<IconContainer>
						<PrintIcon />
					</IconContainer>
					print icon
				</SearchSelectMenuItem>
			</FormSearchSingleSelect>
		</FormContainer>
	);
};

export const ControlledFormSelect = Controlled.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
ControlledFormSelect.args = {
	label: 'Controlled Search Single Select input',
};
