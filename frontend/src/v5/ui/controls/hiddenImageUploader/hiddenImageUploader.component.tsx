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

import { ChangeEvent } from 'react';
import { HiddenImageInput, HiddenInputContainer } from './hiddenImageUploader.styles';

export const getImageFromInputEvent = (event: ChangeEvent<HTMLInputElement>, onUpload: (img: string) => void) => {
	if (!event.target.files.length) return;
	const img = event.target.files[0];
	onUpload(URL.createObjectURL(img));
};

type HiddenImageUploaderProps = {
	onUpload: (img) => void;
	children: any;
	disabled?: boolean;
};
export const HiddenImageUploader = ({ onUpload, children, disabled, ...props }: HiddenImageUploaderProps) => {
	const uploadImage = (event) => getImageFromInputEvent(event, onUpload);

	return (
		<HiddenInputContainer {...props}>
			<HiddenImageInput disabled={disabled} onChange={uploadImage} />
			{children}
		</HiddenInputContainer>
	);
};
