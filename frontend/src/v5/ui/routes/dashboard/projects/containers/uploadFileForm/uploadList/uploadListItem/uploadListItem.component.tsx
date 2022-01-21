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
import { Control, Controller, DeepMap, FieldError } from 'react-hook-form';
import { IUploadFormFields, IUploadItemFields } from '@/v5/ui/routes/dashboard/projects/containers/uploadFileForm/uploadFileForm.component';
import { UploadListItemIconButton } from './components/uploadListItemIconButton/uploadListItemIconButton.component';
import { UploadListItemFileIcon } from './components/uploadListItemFileIcon/uploadListItemFileIcon.component';
import { UploadListItemRow } from './components/fileListItemRow/uploadListItemRow.component';
import { UploadListItemTitle } from './components/uploadListItemTitle/uploadListItemTitle.component';
import { Input } from './fileListItem.styles';

type IUploadListItem = {
	item: IUploadItemFields;
	onClickEdit: () => void;
	onClickDelete: () => void;
	control: Control<IUploadFormFields>;
	index: number;
	errors: DeepMap<IUploadFormFields, FieldError>;
};

export const UploadListItem = ({
	item,
	onClickEdit,
	onClickDelete,
	control,
	index,
	errors,
}: IUploadListItem): JSX.Element => {
	const filesize = '400MB';

	return (
		<UploadListItemRow key={item.id} onClick={() => { }}>
			<span>
				<UploadListItemFileIcon>
					{item.revision.file.name.split('.').at(-1)[0]}
				</UploadListItemFileIcon>
			</span>
			<UploadListItemTitle
				name={item.revision.file.name}
				filesize={filesize}
			/>
			<Controller
				control={control}
				name={`uploads.${index}.container.containerName`}
				defaultValue={item.container.containerName}

				render={({
					field,
				}) => (
					<Input
						error={!!errors.uploads?.[index]?.container?.containerName}
						onChange={(e) => field.onChange(e.target.value)}
						{...field}
					/>
				)}
			/>
			<Controller
				control={control}
				name={`uploads.${index}.revision.tag`}
				defaultValue={item.revision.tag}
				render={({
					field,
				}) => (
					<Input
						error={!!errors.uploads?.[index]?.revision?.tag}
						{...field}
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
