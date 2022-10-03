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
import { TextFieldProps } from '@mui/material';
import { TextField } from './formDateTextField.styles';

type FormDateTextFieldProps = TextFieldProps & {
	formError?: any,
	inputRef?: any,
	onClick: () => void;
};

export const FormDateTextField = ({ inputRef, formError, onClick, ...params }: FormDateTextFieldProps) => {
	const preventManualInsertion = (e) => {
		e.preventDefault();
		onClick();
	};

	return (
		<TextField
			{...params}
			ref={inputRef}
			error={!!formError}
			helperText={formError?.message}
			onClick={preventManualInsertion}
		/>
	);
};
