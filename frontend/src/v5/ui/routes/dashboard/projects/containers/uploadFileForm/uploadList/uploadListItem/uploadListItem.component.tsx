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
import { Button, DeleteButton, Input } from './uploadListItem.styles';

type IUploadListItem = {
	item: UploadItemFields;
	onClickEdit: () => void;
	onClickDelete: () => void;
	onChange: (val) => void;
};

export const UploadListItem = ({
	item,
	onClickEdit,
	onClickDelete,
	onChange,
}: IUploadListItem): JSX.Element => {
	const { control, getValues, formState: { errors } } = useForm({
		defaultValues: item.listItem,
		mode: 'onChange',
		resolver: yupResolver(ListItemSchema),
	});

	return (
		<UploadListItemRow key={item.id} onClick={() => { }} onChange={() => onChange(getValues())}>
			<span>
				<UploadListItemFileIcon extension={item.extension} />
			</span>
			<UploadListItemTitle
				name={item.file.name}
				filesize={filesize(item.file.size)}
			/>
			<Controller
				control={control}
				name="containerName"
				render={({
					field: { ref, ...extras },
				}) => (
					<Input
						error={!!errors.containerName}
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
					<Input
						error={!!errors.revisionTag}
						{...extras}
					/>
				)}
			/>
			<Button onClick={onClickEdit}>
				<EditIcon />
			</Button>
			<DeleteButton onClick={onClickDelete}>
				<DeleteIcon />
			</DeleteButton>
		</UploadListItemRow>
	);
};
