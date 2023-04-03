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
import { FormControl, FormHelperText } from '@mui/material';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { ActionsList, ActionsSide, Container, Label } from './basicTicketImage.styles';
import { TicketImageDisplayer } from './ticketImageDisplayer/ticketImageDisplayer.component';

type BasicTicketImageProps = Omit<FormInputProps, 'onBlur'> & {
	children: any,
};

export const BasicTicketImage = ({
	children,
	value,
	label,
	className,
	error,
	helperText,
	required,
	disabled,
	onChange,
}: BasicTicketImageProps) => {
	const uploadImage = async () => {
		const file = await uploadFile(getSupportedImageExtensions());
		const imgSrc = await convertFileToImageSrc(file);
		onChange?.(imgSrc);
	};
	const isProjectAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();

	return (
		<FormControl error={error} required={required}>
			<Container className={className} error={error} disabled={disabled}>
				<ActionsSide>
					<Label>{label}</Label>
					<ActionsList>{children}</ActionsList>
				</ActionsSide>
				<TicketImageDisplayer
					imgSrc={value}
					disabled={disabled || !isProjectAdmin}
					onEmptyImageClick={uploadImage}
				/>
			</Container>
			<FormHelperText>{helperText}</FormHelperText>
		</FormControl>
	);
};
