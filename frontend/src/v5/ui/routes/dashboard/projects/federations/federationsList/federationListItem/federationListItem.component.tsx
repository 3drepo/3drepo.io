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

import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { formatDate, formatMessage } from '@/v5/services/intl';

import {
	DashboardListItemButton,
	DashboardListItemIcon,
	DashboardListItemRow,
	DashboardListItemText,
} from '@components/dashboard/dashboardList/dashboardListItem/components';
import { DashboardListItemFederationTitle } from '@components/dashboard/dashboardList/dashboardListItem/components/dashboardListItemTitle';
import { Highlight } from '@controls/highlight';
import { Tooltip } from '@mui/material';
import { FavouriteCheckbox } from '@controls/favouriteCheckbox';
import { DashboardListItem } from '@components/dashboard/dashboardList';
import { IFederation } from '@/v5/store/federations/federations.types';
import { SkeletonListItem } from '@/v5/ui/routes/dashboard/projects/federations/federationsList/skeletonListItem';
import { Display } from '@/v5/ui/themes/media';
import { FederationSettingsForm } from '@/v5/ui/routes/dashboard/projects/federations/federationSettingsForm/federationSettingsForm.component';
import { ShareModal } from '@components/dashboard/dashboardList/dashboardListItem/shareModal/shareModal.component';
import { EditFederationModal } from '@/v5/ui/routes/dashboard/projects/federations/editFederationModal/editFederationModal.component';

import { useParams, Link } from 'react-router-dom';
import { viewerRoute } from '@/v5/services/routing/routing';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { enableRealtimeFederationUpdateSettings } from '@/v5/services/realtime/federation.events';
import { FederationEllipsisMenu } from './federationEllipsisMenu/federationEllipsisMenu.component';

const MODALS = {
	share: 'share',
	editFederation: 'editFederation',
	federationSettings: 'federationSettings',
	none: 'none',
};
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
	const { teamspace, project } = useParams<DashboardParams>();

	if (federation.hasStatsPending) {
		return <SkeletonListItem delay={index / 10} key={federation._id} />;
	}
	const [openModal, setOpenModal] = useState(MODALS.none);
	const closeModal = () => setOpenModal(MODALS.none);

	useEffect(() => enableRealtimeFederationUpdateSettings(teamspace, project, federation._id), [federation._id]);

	return (
		<>
			<DashboardListItem
				key={federation._id}
			>
				<DashboardListItemRow>
					<DashboardListItemFederationTitle
						minWidth={90}
						federation={federation}
					>
						<Link to={viewerRoute(teamspace, project, federation)}>
							<Highlight search={filterQuery}>
								{federation.name}
							</Highlight>
						</Link>
					</DashboardListItemFederationTitle>
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
						onClick={() => setOpenModal(MODALS.editFederation)}
						width={165}
						tooltipTitle={
							<FormattedMessage id="federations.list.item.containers.tooltip" defaultMessage="View containers" />
						}
					>
						<FormattedMessage
							id="federations.list.item.containers"
							defaultMessage="{count} containers"
							values={{ count: federation.containers.length }}
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
							openShareModal={() => setOpenModal(MODALS.share)}
							openEditFederationModal={() => setOpenModal(MODALS.editFederation)}
							openFederationSettings={() => setOpenModal(MODALS.federationSettings)}
						/>
					</DashboardListItemIcon>
				</DashboardListItemRow>
				<ShareModal
					openState={openModal === MODALS.share}
					onClickClose={closeModal}
					title={formatMessage({
						id: 'ShareModal.federation.title',
						defaultMessage: 'Share Federation URL',
					})}
					containerOrFederation={federation}
				/>
				<EditFederationModal
					openState={openModal === MODALS.editFederation}
					federation={federation}
					onClickClose={closeModal}
				/>
				<FederationSettingsForm
					open={openModal === MODALS.federationSettings}
					federation={federation}
					onClose={closeModal}
				/>
			</DashboardListItem>
		</>
	);
};
