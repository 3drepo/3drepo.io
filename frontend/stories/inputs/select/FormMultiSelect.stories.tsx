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
import { FormContainer } from '../FormInput.styles';
import { IconContainer, ItemContainer, ItemRenderer } from './FormSelect.styles';

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
		formError: {
			type: 'string',
		},
	},
	component: FormMultiSelect,
	parameters: { controls: { exclude: ['control', 'ref', 'selectedOptionsTooltip', 'onItemClick', 'itemIsSelected', 'renderValueTooltip'] } },
} as ComponentMeta<typeof FormMultiSelect>;

const Controlled: ComponentStory<typeof FormMultiSelect> = ({ formError, ...args }) => {
	const { control } = useForm({ mode: 'onChange' });

	return (
		<FormContainer>
			<FormMultiSelect
				name="multiselect"
				control={control}
				renderValue={(children: any[]) => (
					children.map((child, index) => (
						<ItemRenderer key={child}>
							<ItemContainer>
								{child?.length > 1 ? (
									<>{child[0]}{child[1]}</>
								) : (child)}
							</ItemContainer>
							<span>{index < children.length ? ', ' : ''}</span>
						</ItemRenderer>
					))
				)}
				formError={formError ? { message: formError } : null}
				{...args}
			>
				<MultiSelectMenuItem value="1" key={1}>
					<IconContainer>
						<CalendarIcon />
					</IconContainer>
					calendar icon
				</MultiSelectMenuItem>
				<MultiSelectMenuItem value="2" key={2}>
					<IconContainer>
						<ClearIcon />
					</IconContainer>
					clear icon
				</MultiSelectMenuItem>
				<MultiSelectMenuItem value="3" key={3}>
					<IconContainer>
						<PrintIcon />
					</IconContainer>
					print icon
				</MultiSelectMenuItem>
				<MultiSelectMenuItem value="33" key={33}>
					33
				</MultiSelectMenuItem>
				<MultiSelectMenuItem value="4" key={4}>
					<IconContainer>
						<ChevronIcon />
					</IconContainer>
					chevron icon
				</MultiSelectMenuItem>
				<MultiSelectMenuItem value="5" key={5}>
					<IconContainer>
						<ChevronIcon />
					</IconContainer>
					(disabled) chevron icon
				</MultiSelectMenuItem>
				<MultiSelectMenuItem value="6" key={6} disabled>
					<IconContainer>
						<ChevronIcon />
					</IconContainer>
					chevrone icon
				</MultiSelectMenuItem>
				<MultiSelectMenuItem value="7" key={7}>
					7
				</MultiSelectMenuItem>	
				<MultiSelectMenuItem value="8" key={8}>
					8
				</MultiSelectMenuItem>
				<MultiSelectMenuItem value="9" key={9}>
					some text
				</MultiSelectMenuItem>
				<MultiSelectMenuItem value="10" key={10}>
					some other text
				</MultiSelectMenuItem>
			</FormMultiSelect>
		</FormContainer>
	);
};

export const ControlledFormSelect = Controlled.bind({});
ControlledFormSelect.args = {
	label: 'Controlled Multi Select input',
};

export const ControlledFormSelectWithDefault = Controlled.bind({});
ControlledFormSelectWithDefault.args = {
	label: 'Controlled Multi Select input',
	defaultValue: ['4', '5'],
};
