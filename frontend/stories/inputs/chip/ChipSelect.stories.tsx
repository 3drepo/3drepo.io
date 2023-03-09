/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { PriorityLevels, PRIORITY_LEVELS_MAP } from '@controls/chip/chip.types';
import { ChipSelect } from '@controls/chip/chipSelect/chipSelect.component';
import { SelectChangeEvent } from '@mui/material';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useState } from 'react';

export default {
	title: 'Inputs/Chip/ChipSelect',
	argTypes: {
		tooltip: {
			type: 'string',
		},
		variant: {
			options: ['filled', 'outlined', 'text'],
			control: { type: 'select' },
			defaultValue: 'filled',
		},
		error: {
			type: 'boolean',
		},
		required: {
			type: 'boolean',
		},
		disabled: {
			type: 'boolean',
		},
		values: {
			control: 'object',
			defaultValue: PRIORITY_LEVELS_MAP,
		},
		value: {
			type: 'string',
			defaultValue: PRIORITY_LEVELS_MAP[PriorityLevels.NONE].label,
		},
		onDelete: {
			defaultValue: null,
		},
	},
	component: ChipSelect,
	parameters: { controls: { exclude: ['name', 'inputRef', 'helperText', 'error', 'size', 'onDelete',
		'deleteIcon', 'avatar', 'sx', 'classes', 'clickable', 'children', 'required', 'icon', 'ref'] } },
} as ComponentMeta<typeof ChipSelect>;

const ChipSelectStory: ComponentStory<typeof ChipSelect> = ({ value: initialValue, ...args }: any) => {
	const [value, setValue] = useState(initialValue);
	const handleChange = (event: SelectChangeEvent<any[]>) => {
		setValue(event.target.value as any);
	};
	return (
		<ChipSelect
			{...args}
			value={value}
			onChange={handleChange}
		/>
	);
};

export const ControlledChipSelectExample = ChipSelectStory.bind({});
export const NoLabelExample = ChipSelectStory.bind({});
NoLabelExample.args = {
	label: '',
	variant: 'text',
	tooltip: 'I am a custom tooltip',
};
