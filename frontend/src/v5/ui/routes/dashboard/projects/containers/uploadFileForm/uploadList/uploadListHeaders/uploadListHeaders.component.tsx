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

import { DashboardListHeaderLabel as Label } from '@components/dashboard/dashboardList';
import { FormattedMessage } from 'react-intl';
import { DashboardListHeaderContainer as Container } from '@components/dashboard/dashboardList/dashboardListHeader/dashboardListHeader.styles';
import { SortingDirection } from '@components/dashboard/dashboardList/dashboardList.types';

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
	<Container>
		<Label name="file.name" minWidth={122} sortingDirection={sortingDirection} onClick={onClickFilenameLabel} sort>
			<FormattedMessage id="uploads.list.header.filename" defaultMessage="Filename" />
		</Label>
		<Label width={352}>
			<FormattedMessage id="uploads.list.header.destination" defaultMessage="Destination" />
		</Label>
		<Label width={isUploading ? 359 : 399}>
			<FormattedMessage id="uploads.list.header.revisionName" defaultMessage="Revision Name" />
		</Label>
		<Label width={297} hidden={!isUploading}>
			<FormattedMessage id="uploads.list.header.progress" defaultMessage="Upload Progress" />
		</Label>
	</Container>
);
