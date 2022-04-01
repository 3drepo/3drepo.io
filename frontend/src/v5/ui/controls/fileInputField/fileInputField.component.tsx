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
import { Button } from '@controls/button';
import { FormattedMessage } from 'react-intl';
import { FileLabel, HiddenFileInput } from './fileInputField.styles';

type IFileInputField = ButtonProps & {
	acceptedFormats?: string;
	handleChange: (files) => void;
};

export const FileInputField = ({ acceptedFormats, handleChange, ...props }: IFileInputField) => (
	<FileLabel htmlFor="hidden-file-buton">
		<HiddenFileInput
			accept={acceptedFormats}
			id="hidden-file-buton"
			type="file"
			onChange={(event) => handleChange(event.target.files)}
			multiple
		/>
		<Button component="span" {...props}>
			<FormattedMessage id="fileInput.browse" defaultMessage="Browse" />
		</Button>
	</FileLabel>
);
