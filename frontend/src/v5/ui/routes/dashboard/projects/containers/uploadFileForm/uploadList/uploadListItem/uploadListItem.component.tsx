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
import { UploadItemFields } from '@/v5/store/containers/containers.types';
import { ListItemSchema } from '@/v5/validation/containers';
import { UploadListItemFileIcon } from './components/uploadListItemFileIcon/uploadListItemFileIcon.component';
import { UploadListItemRow } from './components/uploadListItemRow/uploadListItemRow.component';
import { UploadListItemTitle } from './components/uploadListItemTitle/uploadListItemTitle.component';
import { Button, DeleteButton, Input } from './uploadListItem.styles';
import { UploadListItemDestination } from './components/uploadListItemDestination';

type IUploadListItem = {
	item: UploadItemFields;
	onClickEdit: () => void;
	onClickDelete: () => void;
	onChange: (name, val) => void;
};

export const UploadListItem = ({
	item,
	onClickEdit,
	onClickDelete,
	onChange,
}: IUploadListItem): JSX.Element => {
	const filesize = '400MB';
	const { control, getValues, setValue, formState: { errors }, trigger } = useForm({
		defaultValues: item,
		mode: 'onChange',
		resolver: yupResolver(ListItemSchema),
	});

	const updateValue = (name) => onChange(name, getValues(name));

	return (
		<UploadListItemRow key={item.uploadId} onClick={() => { }} onChange={(e) => updateValue(e.target.name)}>
			<span>
				<UploadListItemFileIcon extension={item.extension} />
			</span>
			<UploadListItemTitle
				name={item.file.name}
				filesize={filesize}
			/>
			<Controller
				control={control}
				name="containerName"
				render={({
					field: { ref, ...extras },
				}) => (
					<UploadListItemDestination
						errorMessage={errors.containerName?.message || ''}
						{...extras}
						onChange={({ _id, name }) => {
							setValue('containerId', _id);
							setValue('containerName', name);
							updateValue('containerId');
							updateValue('containerName');
							trigger('containerName');
						}}
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
