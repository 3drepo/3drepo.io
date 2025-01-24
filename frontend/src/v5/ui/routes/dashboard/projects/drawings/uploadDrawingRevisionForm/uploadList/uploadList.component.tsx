/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { UploadItemFields } from '@/v5/store/drawings/revisions/drawingRevisions.types';
import { useContext } from 'react';
import { SortingDirection } from '@components/dashboard/dashboardList/dashboardList.types';
import { useOrderedList } from '@components/dashboard/dashboardList/useOrderedList';
import { UploadFilesContext } from '@components/shared/uploadFiles/uploadFilesContext';
import { DashboardListHeader } from '@components/dashboard/dashboardList';
import { FormattedMessage } from 'react-intl';
import { UploadListItem } from './uploadListItem/uploadListItem.component';
import { ListContainer } from '@components/shared/uploadFiles/uploadList/uploadList.styles';
import { UploadListItemRowWrapper, Label } from './uploadList.styles';

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
	const { selectedId, setSelectedId } = useContext(UploadFilesContext);
	const { sortedList, setSortConfig } = useOrderedList(values, DEFAULT_SORT_CONFIG);

	const deleteItem = (id, isSelected) => {
		removeUploadById(id);
		if (isSelected) setSelectedId();
	};

	return (
		<>
			<DashboardListHeader onSortingChange={setSortConfig} defaultSortConfig={DEFAULT_SORT_CONFIG}>
				<Label name="file.name" minWidth={37} sort>
					<FormattedMessage id="drawing.uploads.list.header.filename" defaultMessage="Filename" />
				</Label>
				<Label width={341} minWidth={100} required>
					<FormattedMessage id="drawing.uploads.list.header.destination" defaultMessage="Drawing Destination" />
				</Label>
				<Label width={260} minWidth={100} required>
					<FormattedMessage id="drawing.uploads.list.header.statusCode" defaultMessage="Status Code" />
				</Label>
				<Label width={isUploading ? 97 : 139} minWidth={78} required>
					<FormattedMessage id="drawing.uploads.list.header.revisionCode" defaultMessage="Revision Code" />
				</Label>
				<Label width={297} hidden={!isUploading}>
					<FormattedMessage id="drawing.uploads.list.header.progress" defaultMessage="Upload Progress" />
				</Label>
				<Label width={48} minWidth={48}>
					{/* Placeholder to account for buttons */}
				</Label>
			</DashboardListHeader>
			<ListContainer>
				{
					values.map(({ uploadId, file, extension, isMultiPagePdf }, index) => {
						const onClickEdit = () => setSelectedId(uploadId);
						const selected = !isUploading && uploadId === selectedId;
						const onClickDelete = () => deleteItem(uploadId, selected);
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
									isMultiPagePdf={isMultiPagePdf}
								/>
							</UploadListItemRowWrapper>
						);
					})
				}
			</ListContainer>
		</>
	);
};
