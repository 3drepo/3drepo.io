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
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { useParams } from 'react-router-dom';
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
import { ErrorMessage } from '@controls/errorMessage/errorMessage.component';
import { Loader } from '@/v4/routes/components/loader/loader.component';
import { ButtonsContainer, ImageButton, GrayBodyText, ImageContainer, Image } from './projectImageInput.styles';

export const ProjectImageInput = ({ onChange, value, error, disabled, helperText }: FormInputProps) => {
	const [imgLoaded, setImgLoaded] = useState(false);
	const [imgSrc, setImgSrc] = useState('');
	const { project } = useParams<DashboardParams>();

	const deleteImage = () => {
		setImgSrc(null);
		onChange(null);
	};

	const updateImage = (file) => {
		convertFileToImageSrc(file).then(setImgSrc);
		onChange(file);
	};

	useEffect(() => {
		if (imgLoaded || !value) return;

		if (isString(value)) {
			testImageExists(value).then((exists) => {
				setImgSrc(exists ? value : '');
				setImgLoaded(true);
			});
		} else {
			convertFileToImageSrc(value).then((valueAsString) => {
				setImgSrc(valueAsString);
				setImgLoaded(true);
			}); 
		}
	}, [value]);

	useEffect(() => { setImgLoaded(false); }, [project]);

	if (!imgLoaded && !disabled) return (<Loader />);

	if (imgSrc) return (
		<>
			{error && (
				<>
					<ErrorMessage>{helperText}</ErrorMessage>
					<Gap $height='26px' />
				</>
			)}
			<ImageContainer>
				<Image src={imgSrc} />
				{!disabled && (
					<ButtonsContainer>
						<FileInputField
							accept={getSupportedImageExtensions()}
							onChange={updateImage}
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

	if (!imgSrc && !disabled) return (
		<DragAndDrop
			onDrop={([file]) => updateImage(file)}
			accept={getSupportedImageExtensions()}
		>
			<Typography variant="h3" color="secondary">
				<FormattedMessage id="dragAndDrop.drop" defaultMessage="Drop file here" />
			</Typography>
			<Typography variant="h5" color="secondary">
				<FormattedMessage id="dragAndDrop.or" defaultMessage="or" />
			</Typography>
			<FileInputField
				accept={getSupportedImageExtensions()}
				onChange={updateImage}
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
					defaultMessage="Maximum file size: 5MB"
				/>
			</GrayBodyText>
		</DragAndDrop>
	);

	return (<></>);
};
