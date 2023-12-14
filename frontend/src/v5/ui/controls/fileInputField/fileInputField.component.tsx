/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import { ButtonProps } from '@mui/material';
import { uuid } from '@/v4/helpers/uuid';
import { useState } from 'react';
import { FileLabel, HiddenFileInput } from './fileInputField.styles';

type IFileInputField = ButtonProps & {
	accept?: string;
	onChange: (files) => void;
	children: any;
	multiple?: boolean;
};

export const FileInputField = ({ accept, onChange, children, multiple = false }: IFileInputField) => {
	const [id] = useState(uuid());

	const handleClick = (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
		const element = event.target as HTMLInputElement;
		element.value = '';
	};
	const handleChange = (event) => {
		let newValue = event.target.files;
		if (!multiple) {
			newValue = newValue[0];
		}
		onChange(newValue);
	};

	return (
		<FileLabel htmlFor={`hidden-file-input-${id}`}>
			<HiddenFileInput
				accept={accept}
				id={`hidden-file-input-${id}`}
				type="file"
				onChange={handleChange}
				onClick={handleClick}
				multiple={multiple}
			/>
			{children}
		</FileLabel>
	);
};
