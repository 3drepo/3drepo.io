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
import { ContainerRevisionsActionsDispatchers, FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { IContainer } from '@/v5/store/containers/containers.types';
import { UploadItemFields } from '@/v5/store/containers/revisions/containerRevisions.types';
import { UploadsSchema } from '@/v5/validation/containerAndFederationSchemes/containerSchemes';
import {
	TeamspacesHooksSelectors,
	ProjectsHooksSelectors,
	ContainerRevisionsHooksSelectors,
	ContainersHooksSelectors,
} from '@/v5/services/selectorsHooks';
import { getSupportedFileExtensions } from '@controls/fileUploader/uploadFile';
import { UploadFiles } from '@components/shared/uploadFiles/uploadFiles.component';
import { UploadFieldArray, UploadFilesContextComponent } from '@components/shared/uploadFiles/uploadFilesContext';
import { extensionIsSpm } from './extensions.helpers';
import { UploadList } from './uploadList/uploadList.component';
import { SidebarForm } from './sidebarForm/sidebarForm.component';
import { parseFileName, reduceFileData } from '@components/shared/uploadFiles/uploadFiles.helpers';
import { formatInfoUnit } from '@/v5/helpers/intl.helper';

type UploadModalLabelTypes = {
	isUploading: boolean;
	fileCount: number;
};
type FormType = UploadFieldArray<UploadItemFields>;

const uploadModalLabels = ({ isUploading, fileCount }: UploadModalLabelTypes) => (isUploading
	? {
		title: formatMessage({
			id: 'container.uploads.modal.title.uploading',
			defaultMessage: '{fileCount, plural, one {Uploading file} other {Uploading files}}',
		}, { fileCount }),
		subtitle: formatMessage({
			id: 'container.uploads.modal.subtitle.uploading',
			defaultMessage: '{fileCount, plural, one {Do not close this window until the upload is complete} other {Do not close this window until uploads are complete}}',
		}, { fileCount }),
		confirmLabel: formatMessage({ id: 'container.uploads.modal.buttonText.uploading', defaultMessage: 'Finished' }),
	}
	: {
		title: formatMessage({
			id: 'container.uploads.modal.title.preparing',
			defaultMessage: '{fileCount, plural, =0 {Add files for upload} one {Prepare file for upload} other {Prepare files for upload}}',
		}, { fileCount }),
		subtitle: formatMessage({
			id: 'container.uploads.modal.title.preparing',
			defaultMessage: '{fileCount, plural, =0 {Drag and drop or browse your computer} other {Select a file to add Container/Revision details}}',
		}, { fileCount }),
		confirmLabel: formatMessage({
			id: 'container.uploads.modal.buttonText.preparing',
			defaultMessage: '{fileCount, plural, one {Upload file} other {Upload files}}',
		}, { fileCount }),
	});

type IUploadContainerRevisionForm = {
	presetContainerId?: string;
	presetFile?: File;
	open: boolean;
	onClickClose: () => void;
};

export const UploadContainerRevisionForm = ({
	presetContainerId,
	presetFile,
	open,
	onClickClose,
}: IUploadContainerRevisionForm): JSX.Element => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	const allUploadsComplete = ContainerRevisionsHooksSelectors.selectUploadIsComplete();
	const revisionsArePending = ContainerRevisionsHooksSelectors.selectRevisionsNotFetched(presetContainerId);
	const presetContainer = ContainersHooksSelectors.selectContainerById(presetContainerId);
	const [isUploading, setIsUploading] = useState<boolean>(false);

	const formData = useForm<FormType>({
		mode: 'onChange',
		resolver: !isUploading ? yupResolver(UploadsSchema) : undefined,
		context: {
			alreadyExistingNames: [],
			teamspace,
			project,
		},
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

	const addFilesToList = (files: File[], container?: IContainer): void => {
		const filesToAppend = [];
		for (const file of files) {
			const extension = file.name.split('.').slice(-1)[0].toLocaleLowerCase();
			filesToAppend.push({
				file,
				progress: 0,
				extension,
				revisionTag: parseFileName(file.name, revTagMaxValue),
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

	const onSubmit = useCallback(handleSubmit(async ({ uploads }: FormType) => {
		if (isUploading) {
			setIsUploading(false);
			onClickClose();
		} else {
			setIsUploading(true);
			uploads.forEach((revision, index) => {
				const { uploadId } = fields[index];
				ContainerRevisionsActionsDispatchers.createRevision(teamspace, project, uploadId, revision);
			});
		}
	}), [fields.length]);

	const supportedFilesMessage = formatMessage({
		id: 'container.uploads.dropzone.message',
		defaultMessage: `
			Supported file formats: IFC, RVT, DGN, FBX, OBJ and <MoreLink>more</MoreLink>{br}
			Maximum file size: {sizeLimit}
		`,
	}, {
		br: <br />,
		sizeLimit: formatInfoUnit(ClientConfig.uploadSizeLimit),
		MoreLink: (child: string) => (
			<a
				href="https://3drepo-help.asite.com/en/articles/9707141-supported-file-formats"
				target="_blank"
				rel="noreferrer"
			>
				{child}
			</a>
		),
	});

	useEffect(() => {
		if (presetFile) {
			addFilesToList([presetFile], presetContainer);
			ContainerRevisionsActionsDispatchers.fetch(
				teamspace,
				project,
				presetContainer._id,
			);
		}
		FederationsActionsDispatchers.fetchFederations(teamspace, project);
	}, []);

	useEffect(() => {
		if (!presetContainerId || !revisionsArePending) return;
		ContainerRevisionsActionsDispatchers.fetch(teamspace, project, presetContainerId);
	}, []);

	return (
		<FormProvider {...formData}>
			{/* @ts-ignore */}
			<UploadFilesContextComponent fields={fields}>
				<UploadFiles
					open={open}
					onClickClose={onClickClose}
					onUploadFiles={addFilesToList}
					onSubmit={onSubmit}
					SideBarComponent={SidebarForm}
					supportedFilesMessage={supportedFilesMessage}
					isUploading={isUploading}
					setIsUploading={setIsUploading}
					modalLabels={uploadModalLabels({ isUploading, fileCount: fields.length })}
					fields={fields}
					isValid={!isUploading ? isValid : allUploadsComplete}
					supportedFileExtensions={getSupportedFileExtensions()}
				>
					<UploadList
						values={reduceFileData(fields)}
						isUploading={isUploading}
						removeUploadById={removeUploadById}
					/>
				</UploadFiles>
			</UploadFilesContextComponent>
		</FormProvider>
	);
};
