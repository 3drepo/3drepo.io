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
import {
	DashboardListItemButton,
	DashboardListItemIcon,
	DashboardListItemRow,
	DashboardListItemText,
	DashboardListItemTitle,
} from '@components/dashboard/dashboardList/dashboardListItem/components';
import { Trans } from '@lingui/react';
import { Highlight } from '@controls/highlight';
import { i18n } from '@lingui/core';
import { Tooltip } from '@material-ui/core';
import { FavouriteCheckbox } from '@controls/favouriteCheckbox';
import { EllipsisButtonWithMenu } from '@controls/ellipsisButtonWithMenu';
import { getFederationMenuItems } from '@/v5/ui/routes/dashboard/projects/federations/federationsList/federationsList.helpers';
import { DashboardListItem } from '@components/dashboard/dashboardList';
import { IFederation } from '@/v5/store/federations/federations.types';

interface IFederationListItem {
	federation: IFederation;
	filterQuery: string;
	onFavouriteChange: (id: string, value: boolean) => void;
}

export const FederationListItem = ({
	federation,
	filterQuery,
	onFavouriteChange,
}: IFederationListItem): JSX.Element => (
	<DashboardListItem
		key={federation._id}
	>
		<DashboardListItemRow>
			<DashboardListItemTitle
				tooltipTitle={
					<Trans id="federations.list.item.title.tooltip" message="Launch in Viewer" />
				}
				subtitle={federation.code}
			>
				<Highlight search={filterQuery}>
					{federation.name}
				</Highlight>
			</DashboardListItemTitle>
			<DashboardListItemButton
				onClick={() => {
					// eslint-disable-next-line no-console
					console.log('handle issues button');
				}}
				width={165}
				tooltipTitle={
					<Trans id="federations.list.item.issues.tooltip" message="View issues" />
				}
			>
				<Trans
					id="federations.list.item.issues"
					message="{count} issues"
					values={{ count: federation.issues }}
				/>
			</DashboardListItemButton>
			<DashboardListItemButton
				onClick={() => {
					// eslint-disable-next-line no-console
					console.log('handle risks button');
				}}
				width={165}
				tooltipTitle={
					<Trans id="federations.list.item.risks.tooltip" message="View risks" />
				}
			>
				<Trans
					id="federations.list.item.risks"
					message="{count} risks"
					values={{ count: federation.risks }}
				/>
			</DashboardListItemButton>
			<DashboardListItemButton
				onClick={() => {
					// eslint-disable-next-line no-console
					console.log('handle containers button');
				}}
				width={165}
				tooltipTitle={
					<Trans id="federations.list.item.containers.tooltip" message="View containers" />
				}
			>
				<Trans
					id="federations.list.item.containers"
					message="{count} containers"
					values={{ count: federation.containers }}
				/>
			</DashboardListItemButton>
			<DashboardListItemText width={188}>
				<Highlight search={filterQuery}>
					{federation.category}
				</Highlight>
			</DashboardListItemText>
			<DashboardListItemText width={97}>
				{federation.lastUpdated ? i18n.date(federation.lastUpdated) : ''}
			</DashboardListItemText>
			<DashboardListItemIcon>
				<Tooltip
					title={
						<Trans id="federations.list.item.favourite.tooltip" message="Add to favourites" />
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
				<EllipsisButtonWithMenu
					list={getFederationMenuItems(federation._id)}
				/>
			</DashboardListItemIcon>
		</DashboardListItemRow>
	</DashboardListItem>
);
