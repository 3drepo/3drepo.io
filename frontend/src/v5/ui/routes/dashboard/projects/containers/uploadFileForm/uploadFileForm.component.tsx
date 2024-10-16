/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';

import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { formatMessage } from '@/v5/services/intl';
import { RevisionsActionsDispatchers, FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { Button } from '@controls/button';
import { IContainer, UploadFieldArray } from '@/v5/store/containers/containers.types';
import { UploadsSchema } from '@/v5/validation/containerAndFederationSchemes/containerSchemes';
import { FormattedMessage } from 'react-intl';
import { Typography } from '@controls/typography';
import { FileInputField } from '@controls/fileInputField/fileInputField.component';
import {
	TeamspacesHooksSelectors,
	ProjectsHooksSelectors,
	RevisionsHooksSelectors,
	ContainersHooksSelectors,
} from '@/v5/services/selectorsHooks';
import { getSupportedFileExtensions } from '@controls/fileUploader/uploadFile';
import { UploadList } from './uploadList/uploadList.component';
import { UploadsContainer, DropZone, Modal, Padding, UploadsListScroll, HelpText } from './uploadFileForm.styles';
import { extensionIsSpm, reduceFileData } from './uploadFileForm.helpers';
import { UploadFileFormContextComponent } from './uploadFileFormContext';
import { Sidebar } from './sideBar/sidebar.component';

type UploadModalLabelTypes = {
	isUploading: boolean;
	fileCount: number;
};

const uploadModalLabels = ({ isUploading, fileCount }: UploadModalLabelTypes) => (isUploading
	? {
		title: formatMessage({
			id: 'uploads.modal.title.uploading',
			defaultMessage: '{fileCount, plural, one {Uploading file} other {Uploading files}}',
		}, { fileCount }),
		subtitle: formatMessage({
			id: 'uploads.modal.subtitle.uploading',
			defaultMessage: '{fileCount, plural, one {Do not close this window until the upload is complete} other {Do not close this window until uploads are complete}}',
		}, { fileCount }),
		confirmLabel: formatMessage({ id: 'uploads.modal.buttonText.uploading', defaultMessage: 'Finished' }),
	}
	: {
		title: formatMessage({
			id: 'uploads.modal.title.preparing',
			defaultMessage: '{fileCount, plural, =0 {Add files for upload} one {Prepare file for upload} other {Prepare files for upload}}',
		}, { fileCount }),
		subtitle: formatMessage({
			id: 'uploads.modal.title.preparing',
			defaultMessage: '{fileCount, plural, =0 {Drag and drop or browse your computer} other {Select a file to add Container/Revision details}}',
		}, { fileCount }),
		confirmLabel: formatMessage({
			id: 'uploads.modal.buttonText.preparing',
			defaultMessage: '{fileCount, plural, one {Upload file} other {Upload files}}',
		}, { fileCount }),
	});

type IUploadFileForm = {
	presetContainerId?: string;
	presetFile?: File;
	open: boolean;
	onClickClose: () => void;
};

export const UploadFileForm = ({
	presetContainerId,
	presetFile,
	open,
	onClickClose,
}: IUploadFileForm): JSX.Element => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	const allUploadsComplete = RevisionsHooksSelectors.selectUploadIsComplete();
	const presetContainer = ContainersHooksSelectors.selectContainerById(presetContainerId);

	const [isUploading, setIsUploading] = useState<boolean>(false);

	const formData = useForm<UploadFieldArray>({
		mode: 'onChange',
		resolver: !isUploading ? yupResolver(UploadsSchema) : undefined,
		context: { alreadyExistingNames: [], teamspace, project },
	});

	const {
		control,
		handleSubmit,
		formState: { isValid },
	} = formData;
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'uploads',
		keyName: 'uploadId',
	});

	const revTagMaxValue = useMemo(() => {
		const schemaDescription =  Yup.reach(UploadsSchema, 'uploads.revisionTag').describe();
		const revTagMax = schemaDescription.tests.find((t) => t.name === 'max');
		return revTagMax.params.max;
	}, []);

	const parseFilename = (filename: string): string => {
		const baseName = filename.split('.').slice(0)[0];
		const noSpecialChars = baseName.replace(/[^a-zA-Z0-9_\- ]/g, '');
		const noSpaces = noSpecialChars.replace(/ /g, '_');
		const noExceedingMax = noSpaces.substring(0, revTagMaxValue);
		return noExceedingMax;
	};

	const addFilesToList = (files: File[], container?: IContainer): void => {
		const filesToAppend = [];
		for (const file of files) {
			const extension = file.name.split('.').slice(-1)[0].toLocaleLowerCase();
			filesToAppend.push({
				file,
				progress: 0,
				extension,
				revisionTag: parseFilename(file.name),
				containerName: container?.name || '',
				containerId: container?._id || '',
				containerUnit: container?.unit || 'mm',
				containerType: container?.type || 'Uncategorised',
				containerCode: container?.code || '',
				containerDesc: container?.desc || '',
				revisionDesc: '',
				lod: '0',
				importAnimations: extensionIsSpm(extension),
				timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London',
			});
		}
		append(filesToAppend);
	};

	const removeUploadById = useCallback((uploadId) => {
		remove(fields.findIndex((field) => field.uploadId === uploadId));
	}, [fields.length]);

	const onSubmit = useCallback(handleSubmit(async ({ uploads }: UploadFieldArray) => {
		if (isUploading) {
			setIsUploading(false);
			onClickClose();
		} else {
			setIsUploading(true);
			uploads.forEach((revision, index) => {
				const { uploadId } = fields[index];
				RevisionsActionsDispatchers.createRevision(teamspace, project, uploadId, revision);
			});
		}
	}), [fields.length]);

	const preventEnter = useCallback((e) => e.key === 'Enter' && e.preventDefault(), []);
	const finishedSubmit = (e) => {
		e.preventDefault();
		setIsUploading(false);
		onClickClose();
	};

	useEffect(() => {
		if (presetFile) {
			addFilesToList([presetFile], presetContainer);
			RevisionsActionsDispatchers.fetch(
				teamspace,
				project,
				presetContainer._id,
			);
		}
		FederationsActionsDispatchers.fetchFederations(teamspace, project);
	}, []);

	return (
		<FormProvider {...formData}>
			<Modal
				open={open}
				onSubmit={!isUploading ? onSubmit : finishedSubmit}
				onClickClose={onClickClose}
				onKeyPress={preventEnter}
				maxWidth="xl"
				isValid={!isUploading ? isValid : allUploadsComplete}
				contrastColorHeader
				fields={fields}
				isUploading={isUploading}
				{...uploadModalLabels({ isUploading, fileCount: fields.length })}
			>
				<UploadFileFormContextComponent fields={fields}>
					<UploadsContainer>
						<UploadsListScroll>
							<Padding>
								{!!fields.length && (
									<UploadList
										values={reduceFileData(fields)}
										isUploading={isUploading}
										removeUploadById={removeUploadById}
									/>
								)}
								<DropZone
									hidden={isUploading}
									onDrop={addFilesToList}
									accept={getSupportedFileExtensions()}
								>
									<Typography variant="h3" color="secondary">
										<FormattedMessage id="dragAndDrop.drop" defaultMessage="Drop files here" />
									</Typography>
									<Typography variant="h5" color="secondary">
										<FormattedMessage id="dragAndDrop.or" defaultMessage="or" />
									</Typography>
									<FileInputField
										accept={getSupportedFileExtensions()}
										onChange={(files) => addFilesToList(files)}
										multiple
									>
										<Button component="span" variant="contained" color="primary">
											<FormattedMessage
												id="uploads.fileInput.browse"
												defaultMessage="Browse"
											/>
										</Button>
									</FileInputField>
									<HelpText>
										<FormattedMessage
											id="uploads.dropzone.message"
											defaultMessage="Supported file formats: IFC, RVT, DGN, FBX, OBJ and <MoreLink>more</MoreLink>"
											values={{
												MoreLink: (child: string) => (
													<a
														href="https://help.3drepo.io/en/articles/4798885-supported-file-formats"
														target="_blank"
														rel="noreferrer"
													>
														{child}
													</a>
												),
											}}
										/>
									</HelpText>
								</DropZone>
							</Padding>
						</UploadsListScroll>
						{!isUploading && <Sidebar />}
					</UploadsContainer>
				</UploadFileFormContextComponent>
			</Modal>
		</FormProvider>
	);
};
