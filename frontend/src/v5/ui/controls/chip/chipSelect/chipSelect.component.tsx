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

import { FormInputProps } from '@controls/inputs/inputController.component';
import { MenuItem } from '@mui/material';
import { useState } from 'react';
import { Chip } from '../chip.component';
import { IChip, IChipMap, IChipMapItem } from '../chip.types';
import { HiddenSelect, IconWrapper } from './chipSelect.styles';

type IChipSelectItem = IChipMapItem & { value: string; };
type IChipSelect = IChip & FormInputProps & { values: IChipMap, defaultValue?: string, onBlur?: () => void; };

const SelectItem = ({ label, icon, color, ...props }: IChipSelectItem) => (
	<MenuItem {...props}>
		<IconWrapper color={color}> {icon} </IconWrapper>
		{label}
	</MenuItem>
);

export const ChipSelect = ({
	values,
	value,
	defaultValue,
	onBlur,
	onChange,
	error,
	helperText,
	disabled,
	...props
}: IChipSelect) => {
	const [open, setOpen] = useState(false);
	const arrayOfListItems: IChipMapItem[] = Object.values(values);

	const handleOpen = () => {
		if (disabled) return;
		setOpen(true);
	};
	const handleClose = () => {
		onBlur?.();
		setOpen(false);
	};

	return (
		<>
			<HiddenSelect
				open={open}
				onOpen={handleOpen}
				onClose={handleClose}
				onChange={onChange}
				value={value}
				defaultValue={defaultValue}
				error={error}
				helperText={helperText}
			>
				{arrayOfListItems.map(({ label, ...itemProps }) => (
					<SelectItem key={label} value={label} label={label} {...itemProps} />
				))}
			</HiddenSelect>
			<Chip disabled={disabled} {...values[value]} onClick={handleOpen} {...props} />
		</>
	);
};
