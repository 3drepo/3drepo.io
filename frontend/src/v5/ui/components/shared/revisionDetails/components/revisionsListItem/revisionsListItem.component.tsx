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
import { SyntheticEvent } from 'react';

import { FormattedMessage } from 'react-intl';
import { Tooltip } from '@mui/material';
import { Container, DownloadButton, DownloadIcon } from './revisionsListItem.styles';
import { RevisionsListItemButton } from './revisionsListItemButton/revisionsListItemButton.component';

type IRevisionsListItem = {
	onSetVoidStatus: (voidStatus: boolean) => void;
	hasPermission: boolean;
	voidStatus: boolean,
	children: any,
	onDownloadRevision: () => void;
	redirectTo?: string;
};

export const RevisionsListItem = ({
	onSetVoidStatus,
	hasPermission,
	voidStatus,
	redirectTo = undefined,
	onDownloadRevision,
	children,
}: IRevisionsListItem): JSX.Element => {
	const disabled = voidStatus;

	const toggleVoidStatus = (e: SyntheticEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onSetVoidStatus(!voidStatus);
	};

	const downloadRevision = (e: SyntheticEvent) => {
		e.preventDefault();
		onDownloadRevision();
	};

	return (
		<Container to={disabled ? undefined : redirectTo} disabled={disabled}>
			{children}
			<RevisionsListItemButton onClick={toggleVoidStatus} status={voidStatus} disabled={!hasPermission} />
			{hasPermission && (
				<Tooltip
					title={(
						<FormattedMessage
							id="revisionDetails.list.item.download.tooltip"
							defaultMessage="Download revision"
						/>
					)}
				>
					<DownloadButton onClick={downloadRevision}>
						<DownloadIcon />
					</DownloadButton>
				</Tooltip>
			)}
		</Container>
	);
};
