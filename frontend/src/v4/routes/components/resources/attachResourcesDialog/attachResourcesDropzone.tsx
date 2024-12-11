/**
 *  Copyright (C) 2019 3D Repo Ltd
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
import { useDropzone } from 'react-dropzone'
import { DropzoneContent, DropZone } from './attachResourcesDialog.styles';

export const ResourcesDropzone = ({ onDrop, errorMessage }) => {
	const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, disabled: !!errorMessage });
	return (
		<DropZone {...getRootProps()}>
			<DropzoneContent isDragActive={isDragActive} error={!!errorMessage}>
			<input {...getInputProps()} />
				{errorMessage || 'Click or drop to add files.'}
			</DropzoneContent>
		</DropZone>
	);
}
