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
import { useFormContext } from 'react-hook-form';
import { UploadItemFields } from '@/v5/store/containers/containers.types';
import { UploadListItem } from './uploadListItem';
import { Container } from './uploadList.styles';

type IUploadList = {
	onClickEdit: (index) => void;
	onClickDelete: (index) => void;
	values: UploadItemFields[];
	selectedIndex: number | null;
};

export const UploadList = ({
	values,
	selectedIndex,
	onClickEdit,
	onClickDelete,
}: IUploadList): JSX.Element => {
	const { trigger, setValue } = useFormContext();
	return (
		<Container>
			{
				values.map((item, index) => (
					<UploadListItem
						key={item.uploadId}
						item={item}
						onClickEdit={() => onClickEdit(index)}
						onClickDelete={() => onClickDelete(index)}
						onChange={(field, val) => {
							setValue(`uploads.${index}.${field}`, val);
							trigger(`uploads.${index}.${field}`);
						}}
						isSelected={index === selectedIndex}
					/>
				))
			}
		</Container>
	);
};
