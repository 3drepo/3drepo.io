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
import * as Yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { formatMessage } from '@/v5/services/intl';
import { yupResolver } from '@hookform/resolvers/yup';
import { UploadItemFields } from '@/v5/store/containers/containers.types';
import { UploadListItemIconButton } from './components/uploadListItemIconButton/uploadListItemIconButton.component';
import { UploadListItemFileIcon } from './components/uploadListItemFileIcon/uploadListItemFileIcon.component';
import { UploadListItemRow } from './components/fileListItemRow/uploadListItemRow.component';
import { UploadListItemTitle } from './components/uploadListItemTitle/uploadListItemTitle.component';
import { Input } from './fileListItem.styles';

type IUploadListItem = {
	item: UploadItemFields;
	onClickEdit: () => void;
	onClickDelete: () => void;
	onChange: (val) => void;
};

export const ListItemSchema = Yup.object().shape({
	revisionTag: Yup.string()
		.min(2,
			formatMessage({
				id: 'uploadFileForm.revision.tag.error.min',
				defaultMessage: 'Container Name must be at least 2 characters',
			}))
		.max(120,
			formatMessage({
				id: 'uploadFileForm.revision.tag.error.max',
				defaultMessage: 'Revision Name is limited to 120 characters',
			}))
		.required(
			formatMessage({
				id: 'uploadFileForm.revision.tag.error.required',
				defaultMessage: 'Revision Name is a required field',
			}),
		),
	containerName: Yup.string()
		.min(3,
			formatMessage({
				id: 'containers.creation.name.error.min',
				defaultMessage: 'Container Name must be at least 2 characters',
			}))
		.max(120,
			formatMessage({
				id: 'containers.creation.name.error.max',
				defaultMessage: 'Container Name is limited to 120 characters',
			}))
		.required(
			formatMessage({
				id: 'containers.creation.name.error.required',
				defaultMessage: 'Container Name is a required field',
			}),
		),
});

export const UploadListItem = ({
	item,
	onClickEdit,
	onClickDelete,
	onChange,
}: IUploadListItem): JSX.Element => {
	const filesize = '400MB';
	const { control, getValues, formState: { errors } } = useForm({
		defaultValues: item.listItem,
		mode: 'onChange',
		resolver: yupResolver(ListItemSchema),
	});

	return (
		<UploadListItemRow key={item.id} onClick={() => { }} onChange={() => onChange(getValues())}>
			<span>
				<UploadListItemFileIcon>
					{item.file.name.split('.').at(-1)[0]}
				</UploadListItemFileIcon>
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
			<UploadListItemIconButton onClick={onClickEdit}>
				<EditIcon />
			</UploadListItemIconButton>
			<UploadListItemIconButton onClick={onClickDelete}>
				<DeleteIcon />
			</UploadListItemIconButton>
		</UploadListItemRow>
	);
};
