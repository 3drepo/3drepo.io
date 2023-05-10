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

import { useEffect } from 'react';
import { stripBase64Prefix } from '@controls/fileUploader/imageFile.helper';
import { FormInputProps } from '@controls/inputs/inputController.component';
import { getImgSrc } from '@/v5/store/tickets/tickets.helpers';
import { BasicTicketImage } from '../basicTicketImage.component';
import { TicketImageActionMenu } from '../ticketImageActionMenu.component';

export const TicketImage = ({ value, onChange, onBlur, ...props }: FormInputProps) => {
	const onImageChange = (newValue) => onChange(newValue ? stripBase64Prefix(newValue) : null);
	const imgSrc = getImgSrc(value);

	useEffect(() => { setTimeout(() => { onBlur?.(); }, 200); }, [value]);

	return (
		<BasicTicketImage
			value={imgSrc}
			onChange={onImageChange}
			{...props}
		>
			<TicketImageActionMenu value={imgSrc} onChange={onImageChange} />
		</BasicTicketImage>
	);
};
