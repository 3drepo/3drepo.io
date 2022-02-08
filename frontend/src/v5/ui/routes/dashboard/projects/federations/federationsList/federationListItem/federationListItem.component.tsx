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

import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { formatDate, formatMessage } from '@/v5/services/intl';

import {
	DashboardListItemButton,
	DashboardListItemIcon,
	DashboardListItemRow,
	DashboardListItemText,
	DashboardListItemTitle,
} from '@components/dashboard/dashboardList/dashboardListItem/components';
import { Highlight } from '@controls/highlight';
import { Tooltip } from '@material-ui/core';
import { FavouriteCheckbox } from '@controls/favouriteCheckbox';
import { DashboardListItem } from '@components/dashboard/dashboardList';
import { IFederation } from '@/v5/store/federations/federations.types';
import { SkeletonListItem } from '@/v5/ui/routes/dashboard/projects/federations/federationsList/skeletonListItem';
import { Display } from '@/v5/ui/themes/media';
import { ShareModal } from '@components/dashboard/dashboardList/dashboardListItem/shareModal/shareModal.component';
import { FederationEllipsisMenu } from './federationEllipsisMenu/federationEllipsisMenu.component';

interface IFederationListItem {
	index: number;
	federation: IFederation;
	filterQuery: string;
	onFavouriteChange: (id: string, value: boolean) => void;
}

export const FederationListItem = ({
	index,
	federation,
	filterQuery,
	onFavouriteChange,
}: IFederationListItem): JSX.Element => {
	if (federation.hasStatsPending) {
		return <SkeletonListItem delay={index / 10} key={federation._id} />;
	}
	const [shareModalOpen, setShareModalOpen] = useState(false);

	return (
		<DashboardListItem
			key={federation._id}
		>
			<DashboardListItemRow>
				<DashboardListItemTitle
					tooltipTitle={
						<FormattedMessage id="federations.list.item.title.tooltip" defaultMessage="Launch in Viewer" />
					}
					subtitle={federation.description}

					minWidth={90}
				>
					<Highlight search={filterQuery}>
						{federation.name}
					</Highlight>
				</DashboardListItemTitle>
				<DashboardListItemButton
					hideWhenSmallerThan={1080}
					onClick={() => {
						// eslint-disable-next-line no-console
						console.log('handle issues button');
					}}
					width={165}
					tooltipTitle={
						<FormattedMessage id="federations.list.item.issues.tooltip" defaultMessage="View issues" />
					}
				>
					<FormattedMessage
						id="federations.list.item.issues"
						defaultMessage="{count} issues"
						values={{ count: federation.issues }}
					/>
				</DashboardListItemButton>
				<DashboardListItemButton
					hideWhenSmallerThan={890}
					onClick={() => {
						// eslint-disable-next-line no-console
						console.log('handle risks button');
					}}
					width={165}
					tooltipTitle={
						<FormattedMessage id="federations.list.item.risks.tooltip" defaultMessage="View risks" />
					}
				>
					<FormattedMessage
						id="federations.list.item.risks"
						defaultMessage="{count} risks"
						values={{ count: federation.risks }}
					/>
				</DashboardListItemButton>
				<DashboardListItemButton
					hideWhenSmallerThan={Display.Tablet}
					onClick={() => {
						// eslint-disable-next-line no-console
						console.log('handle containers button');
					}}
					width={165}
					tooltipTitle={
						<FormattedMessage id="federations.list.item.containers.tooltip" defaultMessage="View containers" />
					}
				>
					<FormattedMessage
						id="federations.list.item.containers"
						defaultMessage="{count} containers"
						values={{ count: federation.containers }}
					/>
				</DashboardListItemButton>
				<DashboardListItemText width={188}>
					<Highlight search={filterQuery}>
						{federation.code}
					</Highlight>
				</DashboardListItemText>
				<DashboardListItemText width={97} minWidth={73}>
					{federation.lastUpdated ? formatDate(federation.lastUpdated) : ''}
				</DashboardListItemText>
				<DashboardListItemIcon>
					<Tooltip
						title={
							<FormattedMessage id="federations.list.item.favourite.tooltip" defaultMessage="Add to favourites" />
						}
					>
						<FavouriteCheckbox
							checked={federation.isFavourite}
							onClick={(event) => {
								event.stopPropagation();
							}}
							onChange={(event) => {
								onFavouriteChange(
									federation._id,
									!!event.currentTarget.checked,
								);
							}}
						/>
					</Tooltip>
				</DashboardListItemIcon>
				<DashboardListItemIcon>
					<FederationEllipsisMenu
						federation={federation}
						openShareModal={() => setShareModalOpen(true)}
					/>
				</DashboardListItemIcon>
			</DashboardListItemRow>
			<ShareModal
				openState={shareModalOpen}
				onClickClose={() => setShareModalOpen(false)}
				title={formatMessage({
					id: 'ShareModal.federation.title',
					defaultMessage: 'Share Federation URL',
				})}
				containerOrFederation={federation}
			/>
		</DashboardListItem>
	);
};
