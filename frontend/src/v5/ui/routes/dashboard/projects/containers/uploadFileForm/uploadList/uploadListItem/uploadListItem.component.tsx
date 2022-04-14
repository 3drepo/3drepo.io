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

import { useEffect } from 'react';
import DeleteIcon from '@assets/icons/delete.svg';
import EditIcon from '@assets/icons/edit.svg';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DestinationOption, UploadItemFields } from '@/v5/store/containers/containers.types';
import filesize from 'filesize';
import { ListItemSchema } from '@/v5/validation/containers';
import { RevisionsHooksSelectors } from '@/v5/services/selectorsHooks/revisionsSelectors.hooks';
import { UploadListItemFileIcon } from './components/uploadListItemFileIcon/uploadListItemFileIcon.component';
import { UploadListItemRow } from './components/uploadListItemRow/uploadListItemRow.component';
import { UploadListItemTitle } from './components/uploadListItemTitle/uploadListItemTitle.component';
import { Button, Destination, RevisionTag } from './uploadListItem.styles';
import { UploadProgress } from './uploadProgress';

type IUploadListItem = {
	item: UploadItemFields;
	defaultValues: {
		containerName: string;
		revisionTag: string;
	}
	isSelected: boolean;
	isUploading: boolean;
	onClickEdit: () => void;
	onClickDelete: () => void;
	onChange: (name, val) => void;
};

export const UploadListItem = ({
	item,
	defaultValues,
	onClickEdit,
	onClickDelete,
	isSelected,
	isUploading,
	onChange,
}: IUploadListItem): JSX.Element => {
	const { control, formState: { errors }, setValue, trigger, watch } = useForm<UploadItemFields>({
		defaultValues,
		mode: 'onChange',
		resolver: yupResolver(ListItemSchema),
	});

	const uploadErrorMessage: string = RevisionsHooksSelectors.selectUploadError(item.uploadId);

	const updateValue = (name) => onChange(name, watch(name));

	useEffect(() => {
		trigger('revisionTag');
		updateValue('revisionTag');
	}, [watch('revisionTag')]);

	return (
		<UploadListItemRow
			key={item.uploadId}
			selected={isSelected}
		>
			<UploadListItemFileIcon extension={item.extension} />
			<UploadListItemTitle
				name={item.file.name}
				filesize={filesize(item.file.size)}
				selectedrow={isSelected}
			/>
			<Destination
				control={control}
				disabled={isUploading}
				errorMessage={errors.containerName?.message}
				defaultValue={defaultValues.containerName}
				onChange={(vals: DestinationOption) => {
					Object.keys(vals).forEach((key: keyof DestinationOption) => {
						if (key === 'latestRevision') return;
						setValue(key, vals[key]);
						updateValue(key);
					});
					trigger('containerName');
				}}
			/>
			<RevisionTag
				control={control}
				disabled={isUploading}
				isSelected={isSelected}
				errorMessage={errors.revisionTag?.message}
			/>
			{ isUploading
				? <UploadProgress uploadId={item.uploadId} errorMessage={uploadErrorMessage} />
				: (
					<>
						<Button $selectedrow={isSelected} onClick={onClickEdit}>
							<EditIcon />
						</Button>
						<Button $selectedrow={isSelected} onClick={onClickDelete}>
							<DeleteIcon />
						</Button>
					</>
				)}
		</UploadListItemRow>
	);
};
