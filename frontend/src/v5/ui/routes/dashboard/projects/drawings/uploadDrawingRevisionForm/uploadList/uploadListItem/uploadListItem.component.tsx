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

import DeleteIcon from '@assets/icons/outlined/delete-outlined.svg';
import EditIcon from '@assets/icons/outlined/edit-outlined.svg';
import { DrawingsHooksSelectors, DrawingRevisionsHooksSelectors, TeamspacesHooksSelectors, ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { InputController } from '@controls/inputs/inputController.component';
import { DashboardListItemRow as UploadListItemRow } from '@components/dashboard/dashboardList/dashboardListItem/components';
import { UploadListItemDestination } from './components/uploadListItemDestination/uploadListItemDestination.component';
import { UploadListItemRevisionCode } from './components/uploadListItemRevisionCode/uploadListItemRevisionCode.component';
import { UploadListItemButton } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItem.styles';
import { useFormContext, useWatch } from 'react-hook-form';
import { useEffect } from 'react';
import { UploadListItemFileIcon } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemFileIcon/uploadListItemFileIcon.component';
import { UploadListItemTitle } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemTitle/uploadListItemTitle.component';
import { UploadProgress } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadProgress/uploadProgress.component';
import { formatMessage } from '@/v5/services/intl';
import { IDrawing } from '@/v5/store/drawings/drawings.types';
import { DrawingRevisionsActionsDispatchers, DrawingsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { UploadListItemStatusCode } from './components/uploadListItemStatusCode/uploadListItemStatusCode.component';
import { UploadStatus } from '@/v5/store/containers/containers.types';
import { DEFAULT_SETTINGS_CALIBRATION } from '../../../../calibration/calibration.helpers';
import { get } from 'lodash';
import { isUniqueRevisionStatusError } from '@/v5/validation/drawingSchemes/drawingSchemes';

const UNEXPETED_STATUS_ERROR = undefined;
const STATUS_TEXT_BY_UPLOAD = {
	[UNEXPETED_STATUS_ERROR]: formatMessage({ id: 'drawing.uploads.progress.status.unexpectedError', defaultMessage: 'Unexpected error' }),
	[UploadStatus.FAILED]: formatMessage({ id: 'drawing.uploads.progress.status.failed', defaultMessage: 'Upload failed' }),
	[UploadStatus.UPLOADED]: formatMessage({ id: 'drawing.uploads.progress.status.uploaded', defaultMessage: 'Upload complete' }),
	[UploadStatus.UPLOADING]: formatMessage({ id: 'drawing.uploads.progress.status.uploading', defaultMessage: 'Uploading' }),
	[UploadStatus.QUEUED]: formatMessage({ id: 'drawing.uploads.progress.status.queued', defaultMessage: 'Waiting to upload' }),
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
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const projectId = ProjectsHooksSelectors.selectCurrentProject();
	const uploadErrorMessage: string = DrawingRevisionsHooksSelectors.selectUploadError(uploadId);
	const { trigger, setValue, formState: { errors } } = useFormContext();
	const drawingId = useWatch({ name: `${revisionPrefix}.drawingId` });
	const statusCode = useWatch({ name: `${revisionPrefix}.statusCode` });
	const revCode = useWatch({ name: `${revisionPrefix}.revCode` });
	const selectedDrawing = DrawingsHooksSelectors.selectDrawingById(drawingId);
	const selectedDrawingRevisions = DrawingRevisionsHooksSelectors.selectRevisions(selectedDrawing?._id);
	const progress = DrawingRevisionsHooksSelectors.selectUploadProgress(uploadId);
	const uploadStatus = getUploadStatus(progress, uploadErrorMessage);

	const sanitiseDrawing = (drawing: IDrawing) => ({
		drawingNumber: drawing?.number || '',
		drawingDesc: drawing?.desc || '',
		drawingType: drawing?.type || '',
		calibration: drawing?.calibration || DEFAULT_SETTINGS_CALIBRATION,
	});

	const revCodeError = get(errors, `${revisionPrefix}.revCode`)?.message;
	const statusCodeError = get(errors, `${revisionPrefix}.statusCode`)?.message;
	const drawingNameError = get(errors, `${revisionPrefix}.drawingName`)?.message;

	useEffect(() => {
		// Dont trigger the error if it was already triggered
		const errorWasAlreadyTriggered = revCodeError === statusCodeError;

		if (errorWasAlreadyTriggered) {
			return;
		}

		// Only trigger the revCode if its clearing the error or if the the unique error was thrown
		if (isUniqueRevisionStatusError(statusCodeError) || !statusCodeError ) {
			trigger(`${revisionPrefix}.revCode`);
		}
	}, [drawingId, statusCodeError]);

	useEffect(() => {
		// Dont trigger the error if it was already triggered
		const errorWasAlreadyTriggered = revCodeError === statusCodeError;

		if (errorWasAlreadyTriggered) {
			return;
		}

		// Only trigger the revCode if its clearing the error or if the the unique error was thrown
		if (isUniqueRevisionStatusError(revCodeError) || !revCodeError ) {
			trigger(`${revisionPrefix}.statusCode`);
		}
	}, [drawingId, revCodeError]);

	useEffect(() => {
		setValue(revisionPrefix, sanitiseDrawing(selectedDrawing));
	}, [JSON.stringify(selectedDrawing)]);

	useEffect(() => {
		if (selectedDrawing?._id) {
			DrawingRevisionsActionsDispatchers.fetch(teamspace, projectId, selectedDrawing._id);
			DrawingsActionsDispatchers.fetchDrawingSettings(teamspace, projectId, selectedDrawing._id);
		}
	}, [selectedDrawing?._id]);

	useEffect(() => {
		if (statusCode && revCode) {
			trigger(`${revisionPrefix}.statusCode`);
		}
	}, [selectedDrawingRevisions]);

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
			<UploadListItemDestination 
				name={`${revisionPrefix}.drawingName`}
				key={`${uploadId}.dest`}
				onSelectNewDestination={onClickEdit}
				index={index}
				revisionPrefix={revisionPrefix}
				disabled={isUploading}
				error={!!drawingNameError}
				helperText={drawingNameError}
			/>
			<InputController
				Input={UploadListItemStatusCode}
				key={`${uploadId}.statusCode`}
				name={`${revisionPrefix}.statusCode`}
				disabled={isUploading}
			/>
			<UploadListItemRevisionCode
				key={`${uploadId}.revCode`}
				name={`${revisionPrefix}.revCode`}
				disabled={isUploading}
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
						<UploadListItemButton variant={isSelected ? 'secondary' : 'primary'} onClick={onClickEdit}>
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
