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
import { useFormContext } from 'react-hook-form';
import { UploadItemFields } from '@/v5/store/containers/containers.types';
import filesize from 'filesize';
import { get } from 'lodash';
import { RevisionsHooksSelectors } from '@/v5/services/selectorsHooks';
import { UploadListItemFileIcon } from './components/uploadListItemFileIcon/uploadListItemFileIcon.component';
import { UploadListItemRow } from './components/uploadListItemRow/uploadListItemRow.component';
import { UploadListItemTitle } from './components/uploadListItemTitle/uploadListItemTitle.component';
import { Button, Destination, RevisionTag } from './uploadListItem.styles';
import { UploadProgress } from './uploadProgress/uploadProgress.component';

type IUploadListItem = {
	item: UploadItemFields;
	revisionPrefix: string;
	defaultValues: {
		containerName: string;
		revisionTag: string;
	}
	isSelected: boolean;
	isUploading: boolean;
	onClickEdit: () => void;
	onClickDelete: () => void;
};

export const UploadListItem = ({
	item,
	revisionPrefix,
	defaultValues,
	onClickEdit,
	onClickDelete,
	isSelected,
	isUploading,
}: IUploadListItem): JSX.Element => {
	const { formState: { errors: formErrors } } = useFormContext();
	const errors = get(formErrors, revisionPrefix);

	const uploadErrorMessage: string = RevisionsHooksSelectors.selectUploadError(item.uploadId);

	return (
		<UploadListItemRow
			key={item.uploadId}
			selected={isSelected}
		>
			<UploadListItemFileIcon extension={item.extension} />
			<UploadListItemTitle
				name={item.file.name}
				filesize={filesize(item.file.size)}
				isSelected={isSelected}
				errorMessage={errors?.file?.message}
			/>
			<Destination
				revisionPrefix={revisionPrefix}
				disabled={isUploading}
				defaultValue={defaultValues.containerName}
			/>
			<RevisionTag
				revisionPrefix={revisionPrefix}
				disabled={isUploading}
				isSelected={isSelected}
				errorMessage={errors?.revisionTag?.message}
			/>
			{isUploading
				? (<UploadProgress uploadId={item.uploadId} errorMessage={uploadErrorMessage} />)
				: (
					<>
						<Button variant={isSelected ? 'secondary' : 'primary'} onClick={onClickEdit}>
							<EditIcon />
						</Button>
						<Button variant={isSelected ? 'secondary' : 'primary'} onClick={onClickDelete}>
							<DeleteIcon />
						</Button>
					</>
				)}
		</UploadListItemRow>
	);
};
