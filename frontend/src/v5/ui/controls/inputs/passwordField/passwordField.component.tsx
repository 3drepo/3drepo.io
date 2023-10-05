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

import VisibleIcon from '@assets/icons/outlined/eye-outlined.svg';
import HiddenIcon from '@assets/icons/outlined/eye_disabled-outlined.svg';
import { TextField, TextFieldProps } from '@controls/inputs/textField/textField.component';
import { useState } from 'react';
import { IconContainer } from './passwordField.styles';

export const PasswordField = (props: TextFieldProps) => {
	const [visible, setVisible] = useState(false);
	const Icon = visible ? VisibleIcon : HiddenIcon;

	return (
		<TextField
			{...props}
			type={visible ? 'text' : 'password'}
			InputProps={{
				endAdornment: (
					<IconContainer onClick={() => setVisible(!visible)}>
						<Icon />
					</IconContainer>
				),
			}}
		/>
	);
};
