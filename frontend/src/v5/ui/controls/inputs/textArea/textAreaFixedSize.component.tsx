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

import { FormControl, FormHelperText, InputLabel, InputProps } from '@mui/material';
import { FormInputProps } from '@controls/inputs/inputController.component';
import { ScrollArea } from '@controls/scrollArea/scrollArea.styles';
import { Container, Input } from './textAreaFixedSize.styles';

export type TextAreaFixedSizeProps = FormInputProps & InputProps & {
	height?: number,
};

export const TextAreaFixedSize = ({
	error,
	helperText,
	name,
	required,
	disabled,
	label,
	value = '', // this is to be certain that is a controlled field
	height = 80,
	className,
	...props
}: TextAreaFixedSizeProps) => (
	<FormControl required={required} disabled={disabled} error={error} className={className}>
		{label && (
			<InputLabel id={`${name}-label`}>
				{label}
			</InputLabel>
		)}
		<Container $error={error} $height={height}>
			<ScrollArea autoHeight autoHeightMin={height} autoHeightMax={height} autoHide>
				<Input
					id={name}
					multiline
					minRows={4}
					$height={height}
					{...props}
					value={value}
					defaultValue={undefined} // this is to be certain that is a controlled field
				/>
			</ScrollArea>
		</Container>
		<FormHelperText>{helperText}</FormHelperText>
	</FormControl>
);
