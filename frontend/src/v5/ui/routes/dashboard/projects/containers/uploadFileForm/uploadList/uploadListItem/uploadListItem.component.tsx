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
import { ContainersHooksSelectors, ProjectsHooksSelectors, RevisionsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { InputController } from '@controls/inputs/inputController.component';
import { DashboardListItemRow as UploadListItemRow } from '@components/dashboard/dashboardList/dashboardListItem/components';
import { UploadListItemFileIcon } from './components/uploadListItemFileIcon/uploadListItemFileIcon.component';
import { UploadListItemTitle } from './components/uploadListItemTitle/uploadListItemTitle.component';
import { UploadProgress } from './components/uploadProgress/uploadProgress.component';
import { UploadListItemDestination } from './components/uploadListItemDestination/uploadListItemDestination.component';
import { UploadListItemRevisionTag } from './components/uploadListItemRevisionTag/uploadListItemRevisionTag.component';
import { UploadListItemButton } from './uploadListItem.styles';
import { useFormContext } from 'react-hook-form';
import { useEffect } from 'react';
import { IContainer, UploadItemFields } from '@/v5/store/containers/containers.types';
import { ContainersActionsDispatchers } from '@/v5/services/actionsDispatchers';

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
	const uploadErrorMessage: string = RevisionsHooksSelectors.selectUploadError(uploadId);
	const { watch, trigger, setValue } = useFormContext();
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const projectId = ProjectsHooksSelectors.selectCurrentProject();
	const containerId = watch(`${revisionPrefix}.containerId`);
	const selectedContainer = ContainersHooksSelectors.selectContainerById(containerId);

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

		ContainersActionsDispatchers.fetchContainerSettings(
			teamspace,
			projectId,
			containerId,
		);
	}, [containerId]);



	return (
		<UploadListItemRow
			selected={isSelected}
		>
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
				disabled={isUploading}
			/>
			<UploadListItemRevisionTag
				key={`${uploadId}.revisionTag`}
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
};
