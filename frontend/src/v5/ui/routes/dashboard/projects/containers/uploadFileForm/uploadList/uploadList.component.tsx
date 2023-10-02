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
import { useCallback, useContext } from 'react';
import { SortingDirection } from '@components/dashboard/dashboardList/dashboardList.types';
import { useOrderedList } from '@components/dashboard/dashboardList/useOrderedList';
import { UploadListItem } from './uploadListItem/uploadListItem.component';
import { ListContainer } from './uploadList.styles';
import { UploadFileFormContext } from '../uploadFileFormContext';
import { UploadListHeaders } from './uploadListHeaders/uploadListHeaders.component';
import { UploadListItemRowWrapper } from './uploadListItem/uploadListItem.styles';

type IUploadList = {
	values: UploadItemFields[];
	removeUploadById: (id: string) => void;
	isUploading: boolean;
};

const DEFAULT_SORT_CONFIG = {
	column: ['file'],
	direction: [SortingDirection.DESCENDING, SortingDirection.ASCENDING],
};

export const UploadList = ({
	values,
	removeUploadById,
	isUploading,
}: IUploadList): JSX.Element => {
	const { selectedId, setSelectedId } = useContext(UploadFileFormContext);
	const { sortedList, setSortConfig } = useOrderedList(values, DEFAULT_SORT_CONFIG);

	const memoizedEdit = useCallback((id) => setSelectedId(id), []);
	const memoizedDelete = useCallback((id, isSelected) => {
		removeUploadById(id);
		if (isSelected) setSelectedId();
	}, [values.length]);
	return (
		<>
			<UploadListHeaders
				setSortConfig={setSortConfig}
				defaultSortConfig={DEFAULT_SORT_CONFIG}
				isUploading={isUploading}
			/>
			<ListContainer>
				{
					values.map(({ uploadId, file, extension }, index) => {
						const onClickEdit = () => memoizedEdit(uploadId);
						const selected = !isUploading && uploadId === selectedId;
						const onClickDelete = () => memoizedDelete(uploadId, selected);
						return (
							<UploadListItemRowWrapper
								key={uploadId}
								selected={selected}
								order={sortedList.findIndex((sortedItem) => sortedItem.uploadId === uploadId)}
							>
								<UploadListItem
									index={index}
									fileData={{ ...file, extension }}
									uploadId={uploadId}
									onClickEdit={onClickEdit}
									onClickDelete={onClickDelete}
									isSelected={selected}
									isUploading={isUploading}
								/>
							</UploadListItemRowWrapper>
						);
					})
				}
			</ListContainer>
		</>
	);
};
