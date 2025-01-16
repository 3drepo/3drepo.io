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

import { useState } from 'react';
import ChevronIcon from '@assets/icons/outlined/thin_chevron-outlined.svg';
import { ActionMenu } from '@controls/actionMenu';
import { Container } from './colorPicker.styles';
import { ColorPickerPalette } from './colorPickerPalette/colorPickerPalette.component';
import { ColorCircle } from './colorCircle/colorCircle.styles';
import { hexGroupColorToRgb, RgbGroupColor, rgbGroupColorToHex } from '@/v5/helpers/colors.helper';


type ColorPickerPreviewProps = { color: string, selected: boolean, disabled?: boolean };
const ColorPickerPreview = ({ color, selected, disabled }: ColorPickerPreviewProps) => (
	<Container selected={selected} disabled={disabled}>
		<ColorCircle $size={10} $color={color} />
		{!disabled && <ChevronIcon />}
	</Container>
);

type ColorPickerProps = { value?: RgbGroupColor, defaultValue?: RgbGroupColor, onChange?: (newVal: RgbGroupColor) => void, disabled?: boolean };
export const ColorPicker = ({ value: inputValue, defaultValue, onChange, disabled }: ColorPickerProps) => {
	const [selected, setSelected] = useState(false);

	const handleChange = (hexValue) => {
		onChange?.(hexGroupColorToRgb(hexValue));
	};

	const value = rgbGroupColorToHex(inputValue || defaultValue);

	return (
		<ActionMenu
			onOpen={() => setSelected(true)}
			onClose={() => setSelected(false)}
			TriggerButton={<ColorPickerPreview selected={selected} color={value?.color} disabled={disabled} />}
			PopoverProps={{
				anchorOrigin: {
					vertical: 'bottom',
					horizontal: 'left',
				},
				transformOrigin: {
					vertical: 'top',
					horizontal: 'left',
				},
			}}
			disabled={disabled}
		>
			<ColorPickerPalette value={value} onChange={handleChange} />
		</ActionMenu>
	);
};
