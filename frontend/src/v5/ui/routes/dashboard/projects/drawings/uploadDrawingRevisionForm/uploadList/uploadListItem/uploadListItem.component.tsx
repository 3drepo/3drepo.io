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
import { DrawingsHooksSelectors, DrawingRevisionsHooksSelectors } from '@/v5/services/selectorsHooks';
import { InputController } from '@controls/inputs/inputController.component';
import { DashboardListItemRow as UploadListItemRow } from '@components/dashboard/dashboardList/dashboardListItem/components';
import { UploadListItemDestination } from './components/uploadListItemDestination/uploadListItemDestination.component';
import { UploadListItemCode } from './components/uploadListItemCode/uploadListItemCode.component';
import { UploadListItemButton } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItem.styles';
import { useFormContext } from 'react-hook-form';
import { useEffect } from 'react';
import { UploadListItemFileIcon } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemFileIcon/uploadListItemFileIcon.component';
import { UploadListItemTitle } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemTitle/uploadListItemTitle.component';
import { UploadProgress } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadProgress/uploadProgress.component';
import { formatMessage } from '@/v5/services/intl';
import { DrawingUploadStatus, IDrawing } from '@/v5/store/drawings/drawings.types';
import { useParams } from 'react-router-dom';
import { DrawingRevisionsActionDispatchers } from '@/v5/services/actionsDispatchers';

const UNEXPETED_STATUS_ERROR = undefined;
const STATUS_TEXT_BY_UPLOAD = {
	[UNEXPETED_STATUS_ERROR]: formatMessage({ id: 'drawing.uploads.progress.status.unexpectedError', defaultMessage: 'Unexpected error' }),
	[DrawingUploadStatus.FAILED]: formatMessage({ id: 'drawing.uploads.progress.status.failed', defaultMessage: 'Upload failed' }),
	[DrawingUploadStatus.UPLOADED]: formatMessage({ id: 'drawing.uploads.progress.status.uploaded', defaultMessage: 'Upload complete' }),
	[DrawingUploadStatus.UPLOADING]: formatMessage({ id: 'drawing.uploads.progress.status.uploading', defaultMessage: 'Uploading' }),
	[DrawingUploadStatus.QUEUED]: formatMessage({ id: 'drawing.uploads.progress.status.queued', defaultMessage: 'Waiting to upload' }),
};

const getUploadStatus = (progress, errorMessage) => {
	if (errorMessage) return DrawingUploadStatus.FAILED;
	if (progress === 100) return DrawingUploadStatus.UPLOADED;
	if (progress < 100 && progress > 0) return DrawingUploadStatus.UPLOADING;
	if (progress === 0) return DrawingUploadStatus.QUEUED;
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
	const { teamspace, project } = useParams();
	const uploadErrorMessage: string = DrawingRevisionsHooksSelectors.selectUploadError(uploadId);
	const { watch, trigger, setValue } = useFormContext();
	const drawingId = watch(`${revisionPrefix}.drawingId`);
	const statusCode = watch(`${revisionPrefix}.statusCode`);
	const revisionCode = watch(`${revisionPrefix}.revisionCode`);
	const selectedDrawing = DrawingsHooksSelectors.selectDrawingById(drawingId);
	const selectedDrawingRevisions = DrawingRevisionsHooksSelectors.selectRevisions(selectedDrawing?._id);
	const progress = DrawingRevisionsHooksSelectors.selectUploadProgress(uploadId);
	const uploadStatus = getUploadStatus(progress, uploadErrorMessage);

	const sanitiseDrawing = (drawing: IDrawing) => ({
		drawingNumber: drawing?.drawingNumber || '',
		drawingDesc: drawing?.desc || '',
		drawingCategory: drawing?.category || '',
	});

	useEffect(() => {
		if (revisionCode) {
			trigger(`${revisionPrefix}.revisionCode`);
		}
	}, [drawingId, statusCode, selectedDrawingRevisions.length]);

	useEffect(() => {
		trigger(`${revisionPrefix}.statusCode`);
	}, [drawingId, revisionCode, selectedDrawingRevisions.length]);

	useEffect(() => {
		for (const [key, val] of Object.entries(sanitiseDrawing(selectedDrawing))) {
			setValue(`${revisionPrefix}.${key}`, val);
		}
		if (selectedDrawing?._id) {
			DrawingRevisionsActionDispatchers.fetch(teamspace, project, selectedDrawing._id);
		}
	}, [JSON.stringify(selectedDrawing)]);

	return (
		<UploadListItemRow selected={isSelected} key={uploadId}>
			<UploadListItemFileIcon extension={fileData.extension} />
			<UploadListItemTitle
				revisionPrefix={revisionPrefix}
				isSelected={isSelected}
				name={fileData.name}
				size={fileData.size}
			/>
			<InputController
				Input={UploadListItemDestination}
				name={`${revisionPrefix}.drawingName`}
				key={drawingId}
				index={index}
				revisionPrefix={revisionPrefix}
				disabled={isUploading}
				onSelectNewDestination={onClickEdit}
			/>
			<UploadListItemCode
				name={`${revisionPrefix}.statusCode`}
				disabled={isUploading}
			/>
			<UploadListItemCode
				name={`${revisionPrefix}.revisionCode`}
				disabled={isUploading}
			/>
			{isUploading
				? (
					<UploadProgress
						uploadId={uploadId}
						errorMessage={uploadErrorMessage}
						uploadStatus={uploadStatus}
						uploadCompleted={uploadStatus === DrawingUploadStatus.UPLOADED}
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
