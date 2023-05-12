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

import { useState, useEffect } from 'react';
import ChevronIcon from '@assets/icons/outlined/thin_chevron-outlined.svg';
import { ActionMenu } from '@controls/actionMenu';
import { Container } from './colorPicker.styles';
import { ColorPickerPalette } from './colorPickerPalette/colorPickerPalette.component';
import { HexGroupColor, RgbGroupColor, UNSET_RGB_COLOR, hexGroupColorToRgb, rgbGroupColorToHex } from './colorPicker.helpers';
import { ColorCircle } from './colorCircle/colorCircle.styles';

const ColorPickerPreview = ({ color, selected }) => (
	<Container selected={selected}>
		<ColorCircle $size={10} $color={color} />
		<ChevronIcon />
	</Container>
);

type ColorPickerProps = { value?: HexGroupColor, defaultValue: HexGroupColor, onChange?: (newVal: HexGroupColor) => void };
export const ColorPicker = ({ value: inputValue, defaultValue, onChange }: ColorPickerProps) => {
	const [value, setValue] = useState<RgbGroupColor>(rgbGroupColorToHex(inputValue || defaultValue || { color: UNSET_RGB_COLOR }));
	const [selected, setSelected] = useState(false);

	const handleChange = (hexValue) => {
		setValue(hexValue);
		onChange?.(hexGroupColorToRgb(hexValue));
	};

	return (
		<ActionMenu
			onOpen={() => setSelected(true)}
			onClose={() => setSelected(false)}
			TriggerButton={<ColorPickerPreview selected={selected} color={value?.color} />}
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
		>
			<ColorPickerPalette value={value} onClose={handleChange} />
		</ActionMenu>
	);
};
