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
import { FormInputProps } from '@controls/inputs/inputController.component';
import { getSupportedImageExtensions, convertFileToImageSrc } from '@controls/fileUploader/imageFile.helper';
import { uploadFile } from '@controls/fileUploader/uploadFile';
import { Actions, Content } from './ticketImageContent.styles';
import { TicketImageDisplayer } from './ticketImageDisplayer/ticketImageDisplayer.component';

type TicketImageContentProps = Omit<FormInputProps, 'onBlur'> & {
	children: any,
	onImageClick?: () => void,
};

export const TicketImageContent = ({
	children,
	value,
	disabled,
	onChange,
	onImageClick,
}: TicketImageContentProps) => {
	const uploadImage = async () => {
		const file = await uploadFile(getSupportedImageExtensions());
		const imgSrc = await convertFileToImageSrc(file);
		onChange?.(imgSrc);
	};

	return (
		<Content>
			<TicketImageDisplayer
				imgSrc={value}
				disabled={disabled}
				onEmptyImageClick={uploadImage}
				onImageClick={onImageClick}
			/>
			<Actions>
				{children}
			</Actions>
		</Content>
	);
};
