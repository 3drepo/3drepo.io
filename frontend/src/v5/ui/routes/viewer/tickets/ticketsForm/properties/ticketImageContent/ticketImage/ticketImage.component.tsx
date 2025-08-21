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
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useSyncProps } from '@/v5/helpers/syncProps.hooks';
import { useOnBlurOnChange } from '../../properties.hooks';

type TicketImageProps = FormInputProps & { onImageClick: () => void; inputRef? };
export const TicketImage = ({ value, onChange:onChangeProp, onBlur, disabled, label, helperText, onImageClick, inputRef = undefined, ...props }: TicketImageProps) => {
	const imgSrc = getImgSrc(value);
	const [imgInModal, setImgInModal] = useState(imgSrc);
	const syncProps = useSyncProps({ images: [imgInModal] });
	const onChange = useOnBlurOnChange(value, onChangeProp, onBlur);
	
	const handleImageClick = () => DialogsActionsDispatchers.open(ImagesModal, {
		onAddMarkup: disabled
			? null
			: (newValue) => onChange(newValue ? stripBase64Prefix(newValue) : null),
	}, syncProps);

	const onUploadNewImage = (newValue) => {
		if (!newValue) {
			onChange(newValue);
			return;
		}

		setImgInModal(newValue);
		DialogsActionsDispatchers.open(ImagesModal, {
			onClose: (newImages) => onChange(stripBase64Prefix(newImages[0])),
			onAddMarkup: setImgInModal,
		}, syncProps);
	};

	useEffect(() => { setImgInModal(imgSrc); }, [imgSrc]);

	return (
		<InputContainer disabled={disabled} ref={inputRef} {...props}>
			<Label>{label}</Label>
			<TicketImageContent
				value={imgSrc}
				onChange={onUploadNewImage}
				disabled={disabled}
				onImageClick={handleImageClick}
			>
				<TicketImageActionMenu value={imgSrc} onChange={onUploadNewImage} disabled={disabled} onClick={handleImageClick} />
			</TicketImageContent>
			<FormHelperText>{helperText}</FormHelperText>
		</InputContainer>
	);
};
