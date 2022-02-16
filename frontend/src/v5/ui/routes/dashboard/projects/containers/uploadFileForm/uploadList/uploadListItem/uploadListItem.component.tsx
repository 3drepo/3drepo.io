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

import React from 'react';
import DeleteIcon from '@assets/icons/delete.svg';
import EditIcon from '@assets/icons/edit.svg';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import filesize from 'filesize';
import { UploadItemFields } from '@/v5/store/containers/containers.types';
import { ListItemSchema } from '@/v5/validation/containers';
import { UploadListItemFileIcon } from './components/uploadListItemFileIcon/uploadListItemFileIcon.component';
import { UploadListItemRow } from './components/uploadListItemRow/uploadListItemRow.component';
import { UploadListItemTitle } from './components/uploadListItemTitle/uploadListItemTitle.component';
import { Button, DeleteButton } from './uploadListItem.styles';
import { UploadListItemRevisionTag } from './components/uploadListItemRevisionTag';
import { UploadListItemDestination } from './components/uploadListItemDestination';

type IUploadListItem = {
	item: UploadItemFields;
	isSelected: boolean;
	onClickRow: () => void;
	onClickEdit: () => void;
	onClickDelete: () => void;
	onChange: (name, val) => void;
};

export const UploadListItem = ({
	item,
	onClickRow,
	onClickEdit,
	onClickDelete,
	isSelected,
	onChange,
}: IUploadListItem): JSX.Element => {
	const { control, getValues, formState: { errors } } = useForm({
		defaultValues: item,
		mode: 'onChange',
		resolver: yupResolver(ListItemSchema),
	});

	const updateValue = (name) => onChange(name, getValues(name));

	return (
		<UploadListItemRow
			key={item.uploadId}
			onClick={onClickRow}
			onChange={(e) => updateValue(e.target.name)}
			selected={isSelected}
		>
			<UploadListItemFileIcon extension={item.extension} />
			<UploadListItemTitle
				name={item.file.name}
				filesize={filesize(item.file.size)}
				selectedrow={isSelected}
			/>
			<Controller
				control={control}
				name="containerName"
				render={({
					field: { ref, ...extras },
				}) => (
					<UploadListItemDestination
						isSelected={isSelected}
						errorMessage={errors.containerName?.message}
						{...extras}
					/>
				)}
			/>
			<Controller
				control={control}
				name="revisionTag"
				render={({
					field: { ref, ...extras },
				}) => (
					<UploadListItemRevisionTag
						isSelected={isSelected}
						errorMessage={errors.revisionTag?.message}
						{...extras}
					/>
				)}
			/>
			<Button $selectedrow={isSelected} onClick={onClickEdit}>
				<EditIcon />
			</Button>
			<DeleteButton $selectedrow={isSelected} onClick={onClickDelete}>
				<DeleteIcon />
			</DeleteButton>
		</UploadListItemRow>
	);
};
