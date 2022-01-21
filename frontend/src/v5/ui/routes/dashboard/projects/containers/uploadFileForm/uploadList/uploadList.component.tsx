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
import { Control, FieldError, DeepMap } from 'react-hook-form/dist/types';
import { UploadListItem } from './uploadListItem';
import { Container } from './uploadList.styles';
import { IUploadFormFields, IUploadItemFields } from '../uploadFileForm.component';

type IUploadList = {
	onClickEdit: (index) => void;
	onClickDelete: (index) => void;
	items: IUploadItemFields[];
	control: Control<IUploadFormFields>;
	errors: DeepMap<IUploadFormFields, FieldError>;
};

export const UploadList = ({
	items,
	onClickEdit,
	onClickDelete,
	control,
	errors,
}: IUploadList): JSX.Element => (
	<Container>
		{
			items.map((item, index) => (
				<UploadListItem
					key={item.id}
					item={item}
					onClickEdit={() => onClickEdit(index)}
					onClickDelete={() => onClickDelete(index)}
					control={control}
					index={index}
					errors={errors}
				/>
			))
		}
	</Container>
);
