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
import { HexColorPicker } from 'react-colorful';
import { useEffect, useRef, useState } from 'react';
import { ColorPickerMenu } from '../colorPickerMenu/colorPickerMenu.component';
import { ColorPickerStyler } from './colorPickerGradient.styles';
import { UNSET_HEX_COLOR } from '../colorPicker.helpers';

export const ColorPickerGradient = ({ value = UNSET_HEX_COLOR, onClose }) => {
	const ref = useRef();
	const [color, setColor] = useState(value);

	useEffect(() => () => {
		if (!ref.current) {
			onClose(color);
		}
	}, [color]);

	return (
		<ColorPickerMenu
			title={formatMessage({ id: 'colorPicker.gradient.title', defaultMessage: 'Custom colour' })}
			onClickClose={() => setColor(value)}
		>
			<ColorPickerStyler ref={ref}>
				<HexColorPicker color={color} onChange={setColor} />
			</ColorPickerStyler>
		</ColorPickerMenu>
	);
};