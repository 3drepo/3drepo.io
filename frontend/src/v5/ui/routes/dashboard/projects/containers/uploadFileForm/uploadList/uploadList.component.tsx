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

import { UploadItemFields } from '@/v5/store/containers/containers.types';
import { useCallback, useContext, useState } from 'react';
import { UploadListItem } from './uploadListItem/uploadListItem.component';
import { ListContainer } from './uploadList.styles';
import { UploadFileFormContext } from '../uploadFileFormContext';
import { UploadListHeaders } from '../uploadListHeaders.component';

type IUploadList = {
	values: UploadItemFields[];
	removeUploadById: (id) => void;
	isUploading: boolean;
};

export const UploadList = ({
	values,
	removeUploadById,
	isUploading,
}: IUploadList): JSX.Element => {
	const { selectedIndex, setSelectedIndex } = useContext(UploadFileFormContext);
	const [isAscending, setIsAscending] = useState(true);

	const memoizedEdit = useCallback((id) => setSelectedIndex(values.findIndex(({ uploadId }) => uploadId === id)), [values.length]);

	const memoizedDelete = useCallback((uploadId) => {
		setSelectedIndex(null);
		removeUploadById(uploadId);
	}, [removeUploadById]);
	return (
		<>
			<UploadListHeaders onClick={() => setIsAscending(!isAscending)} isUploading={isUploading} />
			<ListContainer ascending={isAscending}>
				{
					values.map(({ uploadId, file, extension }, index) => {
						const onClickEdit = () => memoizedEdit(uploadId);
						const onClickDelete = () => memoizedDelete(uploadId);
						return (
							<UploadListItem
								key={uploadId}
								fileData={{ ...file, extension }}
								origIndex={index}
								uploadId={uploadId}
								onClickEdit={onClickEdit}
								onClickDelete={onClickDelete}
								isSelected={!isUploading && index === selectedIndex}
								isUploading={isUploading}
							/>
						);
					})
				}
			</ListContainer>
		</>
	);
};
