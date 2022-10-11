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
import { FormSingleSelect } from '@controls/formSearchSelect/formSingleSelect/formSingleSelect.component';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useForm } from 'react-hook-form';
import ClearIcon from '@assets/icons/controls/clear_circle.svg';
import ChevronIcon from '@assets/icons/chevron.svg';
import CalendarIcon from '@assets/icons/outlined/calendar-outlined.svg';
import PrintIcon from '@assets/icons/print.svg';
import { SingleSelectMenuItem } from '@controls/formSearchSelect/formSingleSelect/singleSelectMenutItem.styles';
import { FormContainer } from '../FormInput.styles';
import { IconContainer, ItemContainer } from './FormSearchSelect.styles';

export default {
	title: 'Inputs/Select/FormSingleSelect',
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
		search: {
			type: 'boolean',
		},
		formError: {
			type: 'string',
		},
	},
	component: FormSingleSelect,
	parameters: { controls: { exclude: ['control', 'ref', 'onItemClick', 'itemIsSelected', 'selectedOptionsTooltip'] } },
} as ComponentMeta<typeof FormSingleSelect>;

const Controlled: ComponentStory<typeof FormSingleSelect> = ({ formError, ...args }: any) => {
	const { control } = useForm({ mode: 'onChange' });

	return (
		<FormContainer>
			<FormSingleSelect
				name="multiselect"
				control={control}
				renderValue={(children) => (
					children?.length > 1 ? (
						<ItemContainer>
							<IconContainer>
								{children[0]}
							</IconContainer>
							{children[1]}
						</ItemContainer>
					) : (children)
				)}
				formError={formError ? { message: formError } : null}
				{...args}
			>
				<SingleSelectMenuItem value={1} key={1}>
					<IconContainer>
						<CalendarIcon />
					</IconContainer>
					calendar icon
				</SingleSelectMenuItem>
				<SingleSelectMenuItem value={2} key={2}>
					<IconContainer>
						<ClearIcon />
					</IconContainer>
					clear icon
				</SingleSelectMenuItem>
				<SingleSelectMenuItem value={3} key={3} disabled>
					<IconContainer>
						<ChevronIcon />
					</IconContainer>
					chevron icon
				</SingleSelectMenuItem>
				<SingleSelectMenuItem value={4} key={4}>
					<IconContainer>
						<PrintIcon />
					</IconContainer>
					print icon
				</SingleSelectMenuItem>
			</FormSingleSelect>
		</FormContainer>
	);
};

export const ControlledFormSelect = Controlled.bind({});
ControlledFormSelect.args = {
	label: 'Controlled Search Single Select input',
};

export const ControlledFormSelectWithDefault = Controlled.bind({});
ControlledFormSelectWithDefault.args = {
	label: 'Controlled Search Single Select input',
	defaultValue: 3,
};
