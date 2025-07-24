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

import DeleteIcon from '@assets/icons/outlined/delete-outlined.svg';
import EditIcon from '@assets/icons/outlined/edit-outlined.svg';
import { ContainersHooksSelectors, ProjectsHooksSelectors, ContainerRevisionsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { InputController } from '@controls/inputs/inputController.component';
import { DashboardListItemRow as UploadListItemRow } from '@components/dashboard/dashboardList/dashboardListItem/components';
import { UploadListItemDestination } from './components/uploadListItemDestination/uploadListItemDestination.component';
import { UploadListItemRevisionTag } from './components/uploadListItemRevisionTag/uploadListItemRevisionTag.component';
import { UploadListItemButton } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItem.styles';
import { useFormContext } from 'react-hook-form';
import { useEffect, type JSX } from 'react';
import { IContainer, UploadStatus } from '@/v5/store/containers/containers.types';
import { UploadItemFields } from '@/v5/store/containers/revisions/containerRevisions.types';
import { ContainerRevisionsActionsDispatchers, ContainersActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { UploadListItemFileIcon } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemFileIcon/uploadListItemFileIcon.component';
import { UploadListItemTitle } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemTitle/uploadListItemTitle.component';
import { UploadProgress } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadProgress/uploadProgress.component';
import { formatMessage } from '@/v5/services/intl';
import { get } from 'lodash';
import { uploadFile } from '@/v5/validation/shared/validators';

const UNEXPETED_STATUS_ERROR = undefined;
const STATUS_TEXT_BY_UPLOAD = {
	[UNEXPETED_STATUS_ERROR]: formatMessage({ id: 'container.uploads.progress.status.unexpectedError', defaultMessage: 'Unexpected error' }),
	[UploadStatus.FAILED]: formatMessage({ id: 'container.uploads.progress.status.failed', defaultMessage: 'Upload failed' }),
	[UploadStatus.UPLOADED]: formatMessage({ id: 'container.uploads.progress.status.uploaded', defaultMessage: 'Upload complete' }),
	[UploadStatus.UPLOADING]: formatMessage({ id: 'container.uploads.progress.status.uploading', defaultMessage: 'Uploading' }),
	[UploadStatus.QUEUED]: formatMessage({ id: 'container.uploads.progress.status.queued', defaultMessage: 'Waiting to upload' }),
};

const getUploadStatus = (progress, errorMessage) => {
	if (errorMessage) return UploadStatus.FAILED;
	if (progress === 100) return UploadStatus.UPLOADED;
	if (progress < 100 && progress > 0) return UploadStatus.UPLOADING;
	if (progress === 0) return UploadStatus.QUEUED;
	return UNEXPETED_STATUS_ERROR;
};

type IUploadListItem = {
	uploadId: string;
	index: number;
	isSelected: boolean;
	isUploading: boolean;
	fileData: {
		size: number;
		name: string;
		extension: string;
	}
	onClickEdit: () => void;
	onClickDelete: () => void;
};

export const UploadListItem = ({
	uploadId,
	index,
	onClickEdit,
	onClickDelete,
	isSelected,
	fileData,
	isUploading,
}: IUploadListItem): JSX.Element => {
	const revisionPrefix = `uploads.${index}`;
	const uploadErrorMessage: string = ContainerRevisionsHooksSelectors.selectUploadError(uploadId);
	const { watch, trigger, setValue, setError, formState: { errors } } = useFormContext();
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const projectId = ProjectsHooksSelectors.selectCurrentProject();
	const containerId = watch(`${revisionPrefix}.containerId`);
	const selectedContainer = ContainersHooksSelectors.selectContainerById(containerId);
	const progress = ContainerRevisionsHooksSelectors.selectUploadProgress(uploadId);
	const fileError = !!get(errors, `${revisionPrefix}.file`)?.message;
	const disabled = fileError || isUploading;

	const uploadStatus = getUploadStatus(progress, uploadErrorMessage);

	const sanitiseContainer = (container: IContainer): Partial<UploadItemFields> => ({
		containerCode: container?.code || '',
		containerType: container?.type || 'Uncategorised',
		containerUnit: container?.unit || 'mm',
		containerDesc: container?.desc,
	});

	useEffect(() => {
		trigger(`${revisionPrefix}.revisionTag`);

		for (const [key, val] of Object.entries(sanitiseContainer(selectedContainer))) {
			setValue(`${revisionPrefix}.${key}`, val);
		}
	}, [JSON.stringify(selectedContainer)]);

	useEffect(() => {
		if (!containerId?.trim()) return;

		ContainersActionsDispatchers.fetchContainerSettings(teamspace, projectId, containerId);
		ContainerRevisionsActionsDispatchers.fetch(teamspace, projectId, containerId);
	}, [containerId]);

	useEffect(() => {
		try { 
			uploadFile.validateSync(fileData);
		} catch (e) {
			setError(`${revisionPrefix}.file`, e);
		}
	}, []);

	return (
		<UploadListItemRow selected={isSelected}>
			<UploadListItemFileIcon extension={fileData.extension} />
			<UploadListItemTitle
				key={`${uploadId}.title`}
				revisionPrefix={revisionPrefix}
				isSelected={isSelected}
				name={fileData.name}
				size={fileData.size}
			/>
			<InputController
				Input={UploadListItemDestination}
				name={`${revisionPrefix}.containerName`}
				key={`${uploadId}.dest`}
				index={index}
				revisionPrefix={revisionPrefix}
				disabled={disabled}
			/>
			<UploadListItemRevisionTag
				key={`${uploadId}.revisionTag`}
				revisionPrefix={revisionPrefix}
				disabled={disabled}
			/>
			{isUploading
				? (
					<UploadProgress
						uploadId={uploadId}
						errorMessage={uploadErrorMessage}
						uploadStatus={uploadStatus}
						uploadCompleted={uploadStatus === UploadStatus.UPLOADED}
						statusText={STATUS_TEXT_BY_UPLOAD[uploadStatus]}
						progress={progress}
					/>
				) : (
					<>
						<UploadListItemButton variant={isSelected ? 'secondary' : 'primary'} onClick={onClickEdit} disabled={disabled}>
							<EditIcon />
						</UploadListItemButton>
						<UploadListItemButton variant={isSelected ? 'secondary' : 'primary'} onClick={onClickDelete}>
							<DeleteIcon />
						</UploadListItemButton>
					</>
				)}
		</UploadListItemRow>
	);
};
