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

import { forwardRef } from 'react';
import { BasicHiddenImageInput, HiddenInputContainer } from './hiddenImageUploader.styles';
import { getImageFromInputEvent } from '../image.helper';

type HiddenImageInputProps = {
	disabled?: boolean;
	onChange: (imgSrc) => void;
	className?: string;
};
export const HiddenImageInput = forwardRef(({ onChange, ...props }: HiddenImageInputProps, ref: any) => {
	const uploadImage = (event) => {
		const imgSrc = getImageFromInputEvent(event);
		onChange(imgSrc);
	};

	return (<BasicHiddenImageInput onChange={uploadImage} {...props} ref={ref} />);
});

type HiddenImageUploaderProps = HiddenImageInputProps & {
	children: any;
};
export const HiddenImageUploader = forwardRef(({
	children,
	className,
	...props
}: HiddenImageUploaderProps, ref) => (
	<HiddenInputContainer className={className}>
		<HiddenImageInput {...props} ref={ref} />
		{children}
	</HiddenInputContainer>
));
