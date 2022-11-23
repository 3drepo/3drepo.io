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

import { memo, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { formatDate, formatMessage } from '@/v5/services/intl';

import {
	DashboardListItemButton,
	DashboardListItemIcon,
	DashboardListItemRow,
	DashboardListItemText,
} from '@components/dashboard/dashboardList/dashboardListItem/components';
import { DashboardListItemFederationTitle } from '@components/dashboard/dashboardList/dashboardListItem/components/dashboardListItemTitle';
import { FavouriteCheckbox } from '@controls/favouriteCheckbox';
import { DashboardListItem } from '@components/dashboard/dashboardList';
import { IFederation } from '@/v5/store/federations/federations.types';
import { Display } from '@/v5/ui/themes/media';
import { FederationSettingsForm } from '@/v5/ui/routes/dashboard/projects/federations/federationSettingsForm/federationSettingsForm.component';
import { EditFederationModal } from '@/v5/ui/routes/dashboard/projects/federations/editFederationModal/editFederationModal.component';

import { useParams } from 'react-router-dom';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { enableRealtimeFederationNewRevision, enableRealtimeFederationRemoved, enableRealtimeFederationUpdateSettings } from '@/v5/services/realtime/federation.events';
import { DialogsActionsDispatchers, FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { prefixBaseDomain, viewerRoute } from '@/v5/services/routing/routing';
import { combineSubscriptions } from '@/v5/services/realtime/realtime.service';
import { FederationEllipsisMenu } from './federationEllipsisMenu/federationEllipsisMenu.component';

const MODALS = {
	editFederation: 'editFederation',
	federationSettings: 'federationSettings',
	none: 'none',
};
interface IFederationListItem {
	federation: IFederation;
}

export const FederationListItem = memo(({
	federation,
}: IFederationListItem): JSX.Element => {
	const { teamspace, project } = useParams<DashboardParams>();

	const [openModal, setOpenModal] = useState(MODALS.none);
	const closeModal = () => setOpenModal(MODALS.none);

	const onClickShare = () => {
		const link = prefixBaseDomain(viewerRoute(teamspace, project, federation));
		const subject = formatMessage({ id: 'shareModal.federation.subject', defaultMessage: 'federation' });
		const title = formatMessage({ id: 'shareModal.federation.title', defaultMessage: 'Share Federation' });

		DialogsActionsDispatchers.open('share', {
			name: federation.name,
			subject,
			title,
			link,
		});
	};

	const onChangeFavourite = ({ currentTarget: { checked } }) => {
		if (checked) {
			FederationsActionsDispatchers.addFavourite(teamspace, project, federation._id);
		} else {
			FederationsActionsDispatchers.removeFavourite(teamspace, project, federation._id);
		}
	};

	useEffect(() => combineSubscriptions(
		enableRealtimeFederationUpdateSettings(teamspace, project, federation._id),
		enableRealtimeFederationRemoved(teamspace, project, federation._id),
		enableRealtimeFederationNewRevision(teamspace, project, federation._id),
	), [federation._id]);

	return (
		<>
			<DashboardListItem
				key={federation._id}
			>
				<DashboardListItemRow>
					<DashboardListItemFederationTitle
						minWidth={90}
						federation={federation}
					/>
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
						disabled
					>
						<FormattedMessage
							id="federations.list.item.issues"
							defaultMessage="{count, plural, =0 {No issues} one {# issue} other {# issues}}"
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
						disabled
					>
						<FormattedMessage
							id="federations.list.item.risks"
							defaultMessage="{count, plural, =0 {No risks} one {# risk} other {# risks}}"
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
							defaultMessage="{count, plural, =0 {No containers} one {# container} other {# containers}}"
							values={{ count: federation.containers.length }}
						/>
					</DashboardListItemButton>
					<DashboardListItemText width={188}>
						{federation.code}
					</DashboardListItemText>
					<DashboardListItemText width={97} minWidth={73}>
						{federation.lastUpdated ? formatDate(federation.lastUpdated) : ''}
					</DashboardListItemText>
					<DashboardListItemIcon>
						<FavouriteCheckbox
							checked={federation.isFavourite}
							onChange={onChangeFavourite}
						/>
					</DashboardListItemIcon>
					<DashboardListItemIcon>
						<FederationEllipsisMenu
							federation={federation}
							openShareModal={onClickShare}
							openEditFederationModal={() => setOpenModal(MODALS.editFederation)}
							openFederationSettings={() => setOpenModal(MODALS.federationSettings)}
						/>
					</DashboardListItemIcon>
				</DashboardListItemRow>
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
});
