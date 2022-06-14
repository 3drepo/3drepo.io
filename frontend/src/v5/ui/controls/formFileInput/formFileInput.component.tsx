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

import { Controller } from 'react-hook-form';
import { IButton as ButtonProps } from '@controls/button/button.component';
import { InputProps } from '@mui/material';
import { Label, Button, Input, ErrorMessage, Container } from './formFileInput.styles';

export type FormFileInputProps = InputProps & {
	control: any,
	formErrors: any,
	name: string,
	buttonProps: ButtonProps,
	onChange: (event: Event, field: any) => void,
};

export const FormFileInput = ({
	name,
	control,
	formError,
	label,
	buttonProps,
	onChange,
	className,
	...otherProps
}) => (
	<Container className={className}>
		<Controller
			name={name}
			control={control}
			render={({ field: { value, ...field } }) => (
				<Button {...buttonProps}>
					<Label htmlFor={name}>
						{label}
						<Input
							id={name}
							{...field}
							{...otherProps}
							onChange={(event) => onChange(event, field)}
						/>
					</Label>
				</Button>
			)}
		/>
		{(formError) && <ErrorMessage>{formError.message}</ErrorMessage>}
	</Container>
);
