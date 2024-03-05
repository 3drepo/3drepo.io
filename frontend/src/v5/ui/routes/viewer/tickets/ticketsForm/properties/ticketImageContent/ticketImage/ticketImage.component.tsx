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

import { useEffect, useState } from 'react';
import { stripBase64Prefix } from '@controls/fileUploader/imageFile.helper';
import { FormInputProps } from '@controls/inputs/inputController.component';
import { getImgSrc } from '@/v5/store/tickets/tickets.helpers';
import { FormHelperText } from '@mui/material';
import { TicketImageContent } from '../ticketImageContent.component';
import { TicketImageActionMenu } from '../ticketImageActionMenu.component';
import { InputContainer, Label } from './ticketImage.styles';
import { ImagesModal } from '@components/shared/modalsDispatcher/templates/imagesModal/imagesModal.component';

type TicketImageProps = FormInputProps & { onImageClick: () => void; };
export const TicketImage = ({ value, onChange, onBlur, disabled, label, helperText, onImageClick, ...props }: TicketImageProps) => {
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const imgSrc = getImgSrc(value);

	const openImageModal = () => setModalIsOpen(true);

	const onImageChange = (newValue) => {
		onChange(newValue ? stripBase64Prefix(newValue) : null);
		if (newValue) {
			openImageModal();
		}
	};

	useEffect(() => onBlur?.(), [value]);

	return (
		<>
			<InputContainer disabled={disabled} {...props}>
				<Label>{label}</Label>
				<TicketImageContent
					value={imgSrc}
					onChange={onImageChange}
					disabled={disabled}
					onImageClick={openImageModal}
				>
					<TicketImageActionMenu value={imgSrc} onChange={onImageChange} disabled={disabled} onClick={openImageModal} />
				</TicketImageContent>
				<FormHelperText>{helperText}</FormHelperText>
			</InputContainer>
			{modalIsOpen && (
				<ImagesModal
					open
					images={[imgSrc]}
					onAddMarkup={disabled ? null : onImageChange}
					onClickClose={() => setModalIsOpen(false)}
				/>
			)}
		</>
	);
};
