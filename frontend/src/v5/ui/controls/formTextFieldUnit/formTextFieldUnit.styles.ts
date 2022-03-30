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

import { HTMLInputTypeAttribute } from 'react';
import styled from 'styled-components';
import { FormTextField, FormTextFieldProps } from '@controls/formTextField/formTextField.component';

export const UnitTextField = styled(FormTextField).attrs((
	props: FormTextFieldProps & { $labelUnit: string },
) => ({
	label: ` (${props.$labelUnit})`,
	type: 'number' as HTMLInputTypeAttribute,
}))<{ $labelName: string, $labelUnit: string }>`
	.MuiInputLabel-formControl {
		&::before {
			content: "${({ $labelName }) => $labelName}";
			${({ theme }) => theme.typography.kicker};
		}
		
		text-transform: none; 
		letter-spacing: 0;
	}
`;
