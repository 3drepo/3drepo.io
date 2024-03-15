/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { useCallback } from 'react';
import { Button } from '@controls/button';
import { FormattedMessage } from 'react-intl';
import { Typography } from '@controls/typography';
import { FileInputField } from '@controls/fileInputField/fileInputField.component';
import { UploadsContainer, DropZone, Modal, Padding, UploadsListScroll, HelpText } from './uploadFiles.styles';
import { UploadFilesSidebar } from './uploadFilesSideBar/uploadFilesSideBar.component';

type IUploadFiles = {
	open: boolean;
	onClickClose: () => void;
	onUploadFiles: (files: File[], containerOrDrawing?) => void;
	onSubmit: () => void;
	SideBarComponent: any,
	supportedFilesMessage: string | any,
	isUploading: boolean,
	setIsUploading: (isUploading: boolean) => void,
	modalLabels: any,
	children: any,
	fields: any[],
	isValid: boolean,
	supportedFileExtensions: string,
};
export const UploadFiles = ({
	open,
	onClickClose,
	onUploadFiles,
	onSubmit,
	SideBarComponent,
	supportedFilesMessage,
	isUploading,
	setIsUploading,
	modalLabels,
	children,
	fields,
	isValid,
	supportedFileExtensions,
}: IUploadFiles) => {

	const preventEnter = useCallback((e) => e.key === 'Enter' && e.preventDefault(), []);

	const finishedSubmit = (e) => {
		e.preventDefault();
		setIsUploading(false);
		onClickClose();
	};

	return (
		<Modal
			open={open}
			onSubmit={!isUploading ? onSubmit : finishedSubmit}
			onClickClose={onClickClose}
			onKeyPress={preventEnter}
			maxWidth="xl"
			isValid={isValid}
			contrastColorHeader
			fields={fields}
			isUploading={isUploading}
			{...modalLabels}
		>
			<UploadsContainer>
				<UploadsListScroll>
					<Padding>
						{!!fields.length && <>{children}</>}
						<DropZone
							hidden={isUploading}
							onDrop={onUploadFiles}
							accept={supportedFileExtensions}
						>
							<Typography variant="h3" color="secondary">
								<FormattedMessage id="dragAndDrop.drop" defaultMessage="Drop files here" />
							</Typography>
							<Typography variant="h5" color="secondary">
								<FormattedMessage id="dragAndDrop.or" defaultMessage="or" />
							</Typography>
							<FileInputField
								accept={supportedFileExtensions}
								onChange={(files) => onUploadFiles(files)}
								multiple
							>
								<Button component="span" variant="contained" color="primary">
									<FormattedMessage
										id="uploads.fileInput.browse"
										defaultMessage="Browse"
									/>
								</Button>
							</FileInputField>
							<HelpText>{supportedFilesMessage}</HelpText>
						</DropZone>
					</Padding>
				</UploadsListScroll>
				{!isUploading && (
					<UploadFilesSidebar>
						<SideBarComponent />
					</UploadFilesSidebar>
				)}
			</UploadsContainer>
		</Modal>
	);
};
