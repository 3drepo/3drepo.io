/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { DashboardListHeaderLabel } from '@components/dashboard/dashboardList';
import { FormattedMessage } from 'react-intl';
import { DashboardListHeaderContainer } from '@components/dashboard/dashboardList/dashboardListHeader/dashboardListHeader.styles';
import { SortingDirection } from '@components/dashboard/dashboardList/dashboardList.types';
import { FilenameLabelWrapper } from './uploadListHeaders.styles';

type IUploadListHeaders = {
	onClickFilenameLabel: () => void;
	isUploading: boolean;
	sortingDirection: SortingDirection;
};

export const UploadListHeaders = ({
	onClickFilenameLabel,
	isUploading,
	sortingDirection,
}: IUploadListHeaders) => (
	<DashboardListHeaderContainer>
		<DashboardListHeaderLabel name="file.name" minWidth={122} sortingDirection={sortingDirection} sort>
			<FilenameLabelWrapper onClick={onClickFilenameLabel}>
				<FormattedMessage id="uploads.list.header.filename" defaultMessage="Filename" />
			</FilenameLabelWrapper>
		</DashboardListHeaderLabel>
		<DashboardListHeaderLabel width={352}>
			<FormattedMessage id="uploads.list.header.destination" defaultMessage="Destination" />
		</DashboardListHeaderLabel>
		<DashboardListHeaderLabel width={isUploading ? 359 : 399}>
			<FormattedMessage id="uploads.list.header.revisionName" defaultMessage="Revision Name" />
		</DashboardListHeaderLabel>
		<DashboardListHeaderLabel width={297} hidden={!isUploading}>
			<FormattedMessage id="uploads.list.header.progress" defaultMessage="Upload Progress" />
		</DashboardListHeaderLabel>
	</DashboardListHeaderContainer>
);
