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

import { FormInputProps } from '@controls/inputs/inputController.component';
import { Switch, SwitchProps } from '@mui/material';
import { FormControlLabel } from './toggle.styles';

export type ToggleProps = FormInputProps & SwitchProps;
export const Toggle = ({ name, label, disabled, required, value, error, helperText, ...props }: ToggleProps) => (
	<FormControlLabel
		disabled={disabled}
		label={label}
		control={(
			<Switch
				id={name}
				checked={value || false} // This is to fix uncontrolled to controlled change. It always has a value.
				{...props}
			/>
		)}
	/>
);
