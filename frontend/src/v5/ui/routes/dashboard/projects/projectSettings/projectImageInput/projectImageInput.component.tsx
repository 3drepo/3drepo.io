/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { convertFileToImageSrc, getSupportedImageExtensions, testImageExists } from '@controls/fileUploader/imageFile.helper';
import { FormattedMessage } from 'react-intl';
import { Typography } from '@mui/material';
import { FormInputProps } from '@controls/inputs/inputController.component';
import { FileInputField } from '@controls/fileInputField/fileInputField.component';
import { Gap } from '@controls/gap';
import { Button } from '@controls/button';
import { DragAndDrop } from '@controls/dragAndDrop';
import EditIcon from '@assets/icons/outlined/edit_comment-outlined.svg';
import DeleteIcon from '@assets/icons/outlined/delete-outlined.svg';
import { isString } from 'lodash';
import { formatMessage } from '@/v5/services/intl';
import { useFormContext } from 'react-hook-form';
import { ButtonsContainer, ImageButton, GrayBodyText, ImageContainer, Image, ErrorMessage } from './projectImageInput.styles';
import { PROJECT_IMAGE_MAX_SIZE_MESSAGE } from '@/v5/store/projects/projects.helpers';

export const ProjectImageInput = ({ onChange, value, name, error, disabled, helperText }: FormInputProps) => {
	const [imgSrc, setImgSrc] = useState(value);
	const { setError } = useFormContext();

	const deleteImage = () => onChange(null);

	const uploadImage = async (file) => {
		const fileSrc = await convertFileToImageSrc(file);
		try {
			await testImageExists(fileSrc);
			onChange(file);
		} catch (e) {
			setError(name, {
				type: 'custom',
				message: formatMessage({
					id: 'project.settings.image.error.invalidUpload',
					defaultMessage: 'The file seems invalid, please try again with a different one',
				}),
			});
		}
	};

	useEffect(() => {
		if (!value) {
			setImgSrc(null);
			return;
		}

		if (isString(value)) {
			testImageExists(value)
				.then((authSrc) => setImgSrc(authSrc))
				.catch(() => setImgSrc(null));
			return;
		}
		
		// value is a file
		convertFileToImageSrc(value).then(setImgSrc); 
	}, [value]);

	if (imgSrc) return (
		<>
			{error && (
				<>
					<ErrorMessage>{helperText}</ErrorMessage>
					<Gap $height='28px' />
				</>
			)}
			<ImageContainer>
				<Image src={imgSrc} />
				{!disabled && (
					<ButtonsContainer>
						<FileInputField
							accept={getSupportedImageExtensions()}
							onChange={uploadImage}
						>
							<ImageButton variant="primary" as="span">
								<EditIcon />
								<FormattedMessage
									id="project.settings.form.image.change"
									defaultMessage="Change"
								/>
							</ImageButton>
						</FileInputField>
						<ImageButton variant="error" onClick={deleteImage}>
							<DeleteIcon />
							<FormattedMessage
								id="project.settings.form.image.delete"
								defaultMessage="Delete"
							/>
						</ImageButton>
					</ButtonsContainer>
				)}
			</ImageContainer>
		</>
	);

	return (
		<>
			{error && (
				<>
					<ErrorMessage>{helperText}</ErrorMessage>
					<Gap $height='28px' />
				</>
			)}
			<DragAndDrop
				onDrop={([file]) => uploadImage(file)}
				accept={getSupportedImageExtensions()}
			>
				<Typography variant="h3" color="secondary">
					<FormattedMessage id="project.settings.dragAndDrop.drop" defaultMessage="Drop file here" />
				</Typography>
				<Typography variant="h5" color="secondary">
					<FormattedMessage id="project.settings.dragAndDrop.or" defaultMessage="or" />
				</Typography>
				<FileInputField
					accept={getSupportedImageExtensions()}
					onChange={uploadImage}
				>
					<Button component="span" variant="contained" color="primary">
						<FormattedMessage
							id="project.settings.form.image.browse"
							defaultMessage="Browse"
						/>
					</Button>
				</FileInputField>
				<Gap $height='19px' />
				<GrayBodyText>
					<FormattedMessage
						id="project.settings.form.image.supportedFormats"
						defaultMessage="Supported file formats: JPG, PNG, GIF."
					/>
				</GrayBodyText>
				<GrayBodyText>
					<FormattedMessage
						id="project.settings.form.image.maxFileSize"
						defaultMessage="Maximum file size: {size}"
						values={{ size: PROJECT_IMAGE_MAX_SIZE_MESSAGE }}
					/>
				</GrayBodyText>
			</DragAndDrop>
		</>
	);
};
