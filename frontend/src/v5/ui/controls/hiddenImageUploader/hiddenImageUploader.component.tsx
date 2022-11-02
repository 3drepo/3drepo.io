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

import { BasicHiddenImageInput, HiddenInputContainer } from './hiddenImageUploader.styles';
import { getImageFromInputEvent } from './Image.helper';

export const HiddenImageInput = ({ onChange, ...props }) => {
	const uploadImage = (event) => {
		const imgSrc = getImageFromInputEvent(event);
		onChange(imgSrc);
	};

	return  (<BasicHiddenImageInput onChange={uploadImage} {...props} />);
};

type HiddenImageUploaderProps = {
	children: any;
	disabled?: boolean;
	onChange: (imgSrc) => void;
};
export const HiddenImageUploader = ({
	children,
	disabled,
	onChange,
	...props
}: HiddenImageUploaderProps) => (
	<HiddenInputContainer {...props}>
		<HiddenImageInput disabled={disabled} onChange={onChange} />
		{children}
	</HiddenInputContainer>
);
