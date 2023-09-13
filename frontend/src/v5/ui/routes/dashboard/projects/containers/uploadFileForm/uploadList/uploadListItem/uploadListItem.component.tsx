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
import { RevisionsHooksSelectors } from '@/v5/services/selectorsHooks';
import { memo } from 'react';
import { isEqual } from 'lodash';
import { InputController } from '@controls/inputs/inputController.component';
import { DashboardListItemRow as UploadListItemRow } from '@components/dashboard/dashboardList/dashboardListItem/components';
import { UploadListItemFileIcon } from './components/uploadListItemFileIcon/uploadListItemFileIcon.component';
import { UploadListItemTitle } from './components/uploadListItemTitle/uploadListItemTitle.component';
import { UploadProgress } from './components/uploadProgress/uploadProgress.component';
import { UploadListItemDestination } from './components/uploadListItemDestination/uploadListItemDestination.component';
import { UploadListItemRevisionTag } from './components/uploadListItemRevisionTag/uploadListItemRevisionTag.component';
import { UploadListItemButton } from './uploadListItem.styles';

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

export const UploadListItem = memo(({
	uploadId,
	index,
	onClickEdit,
	onClickDelete,
	isSelected,
	fileData,
	isUploading,
}: IUploadListItem): JSX.Element => {
	const revisionPrefix = `uploads.${index}`;
	const uploadErrorMessage: string = RevisionsHooksSelectors.selectUploadError(uploadId);
	return (
		<UploadListItemRow
			key={uploadId}
			selected={isSelected}
		>
			<UploadListItemFileIcon extension={fileData.extension} />
			<UploadListItemTitle
				key={`${revisionPrefix}.title`}
				revisionPrefix={revisionPrefix}
				isSelected={isSelected}
				name={fileData.name}
				size={fileData.size}
			/>
			<InputController
				Input={UploadListItemDestination}
				name={`${revisionPrefix}.containerName`}
				key={`${revisionPrefix}.dest`}
				// @ts-ignore
				revisionPrefix={revisionPrefix}
				disabled={isUploading}
			/>
			<UploadListItemRevisionTag
				key={`${revisionPrefix}.revTag`}
				revisionPrefix={revisionPrefix}
				disabled={isUploading}
			/>
			{isUploading
				? (<UploadProgress uploadId={uploadId} errorMessage={uploadErrorMessage} />)
				: (
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
},
(prevProps, nextProps) => {
	const filterProperties = ({ isSelected, index, isUploading }) => ({ isSelected, index, isUploading });
	return isEqual(filterProperties(prevProps), filterProperties(nextProps));
});
