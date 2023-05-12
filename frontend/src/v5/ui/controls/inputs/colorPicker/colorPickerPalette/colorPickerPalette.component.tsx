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

import { formatMessage } from '@/v5/services/intl';
import { useEffect, useRef, useState } from 'react';
import { clamp } from 'lodash';
import { ColorGrid, BottomBar, HexTextField, PercentageTextField, SquaredColorOption, GradientButton, ColorOption, ColorActionMenu } from './colorPickerPalette.styles';
import { ColorPickerMenu } from '../colorPickerMenu/colorPickerMenu.component';
import { ColorPickerGradient } from '../colorPickerGradient/colorPickerGradient.component';
import { HexGroupColor, getColorIsValid, DEFAULT_SUGGESTED_HEX_COLORS, UNSET_HEX_COLOR } from '../colorPicker.helpers';

type ColorPickerPaletteProps = {
	value: HexGroupColor,
	onClose: (value: HexGroupColor) => void,
};
export const ColorPickerPalette = ({ value, onClose }: ColorPickerPaletteProps) => {
	const [color, setColor] = useState<string>(value.color);
	const [opacity, setOpacity] = useState<number>(value.opacity);
	const ref = useRef();

	const colorisValid = getColorIsValid(color);
	const opacityInPercentage = Math.round((opacity ?? 1) * 100);

	const handleColorChange = (newColor) => setColor(`#${newColor}`);
	const handleOpacityChange = (e) => {
		const valueInRange = clamp(e.currentTarget.value, 0, 100) / 100;
		setOpacity(valueInRange);
	};

	const handleOpacityKeyDown = (e) => {
		if (e.key === '.') e.preventDefault();
	};

	const resetValues = () => {
		setColor(value.color);
		setOpacity(value.opacity);
	};

	useEffect(() => () => {
		if (colorisValid && !ref.current) {
			onClose({ color, opacity });
		}
	}, [color, opacity]);

	return (
		<span ref={ref}>
			<ColorPickerMenu
				title={formatMessage({ id: 'colorPicker.palette.title', defaultMessage: 'Select colour' })}
				onClickClose={resetValues}
			>
				<ColorGrid>
					<ColorOption onClick={() => setColor(null)} />
					{DEFAULT_SUGGESTED_HEX_COLORS.map((suggestedColor) => (
						<ColorOption $color={suggestedColor} onClick={() => setColor(suggestedColor)} key={suggestedColor} />
					))}
				</ColorGrid>
				<BottomBar>
					<SquaredColorOption $color={colorisValid ? color : value.color} $opacity={opacity} />
					<HexTextField
						label={formatMessage({ id: 'colorPicker.palette.hex', defaultMessage: 'Hex' })}
						value={color?.slice(1) ?? ''}
						error={!colorisValid}
						onChange={(e) => handleColorChange(e.currentTarget.value)}
					/>
					<PercentageTextField
						label={formatMessage({ id: 'colorPicker.palette.opacity', defaultMessage: 'Opacity' })}
						// stringify to remove leading 0
						value={opacityInPercentage.toString()}
						onKeyDown={handleOpacityKeyDown}
						onChange={handleOpacityChange}
					/>
					<ColorActionMenu TriggerButton={<GradientButton />}>
						<ColorPickerGradient value={color || UNSET_HEX_COLOR} onClose={setColor} />
					</ColorActionMenu>
				</BottomBar>
			</ColorPickerMenu>
		</span>
	);
};
