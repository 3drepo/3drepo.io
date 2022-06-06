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

import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Tooltip } from '@mui/material';
import {
	DashboardListItemButton,
	DashboardListItemIcon,
	DashboardListItemRow,
	DashboardListItemText,
} from '@components/dashboard/dashboardList/dashboardListItem/components';
import { DashboardListItemContainerTitle } from '@components/dashboard/dashboardList/dashboardListItem/components/dashboardListItemTitle';
import { Highlight } from '@controls/highlight';
import { FavouriteCheckbox } from '@controls/favouriteCheckbox';
import { DashboardListItem } from '@components/dashboard/dashboardList';
import { IContainer } from '@/v5/store/containers/containers.types';
import { RevisionDetails } from '@components/shared/revisionDetails';
import { Display } from '@/v5/ui/themes/media';
import { formatDate, formatMessage } from '@/v5/services/intl';
import { SkeletonListItem } from '@/v5/ui/routes/dashboard/projects/federations/federationsList/skeletonListItem';
import { ShareModal } from '@components/dashboard/dashboardList/dashboardListItem/shareModal/shareModal.component';
import { ContainerEllipsisMenu } from './containerEllipsisMenu/containerEllipsisMenu.component';
import { ContainerSettingsForm } from '../../containerSettingsForm/containerSettingsForm.component';

const MODALS = {
	share: 'share',
	containerSettings: 'containerSettings',
	none: 'none',
};

interface IContainerListItem {
	index: number;
	isSelected: boolean;
	container: IContainer;
	filterQuery: string;
	onFavouriteChange: (id: string, value: boolean) => void;
	onSelectOrToggleItem: (id: string) => void;
}

export const ContainerListItem = ({
	index,
	isSelected,
	container,
	filterQuery,
	onSelectOrToggleItem,
	onFavouriteChange,
}: IContainerListItem): JSX.Element => {
	if (container.hasStatsPending) {
		return <SkeletonListItem delay={index / 10} key={container._id} />;
	}
	const [openModal, setOpenModal] = useState(MODALS.none);
	const closeModal = () => setOpenModal(MODALS.none);

	return (
		<DashboardListItem
			selected={isSelected}
			key={container._id}
		>
			<DashboardListItemRow
				selected={isSelected}
				onClick={() => onSelectOrToggleItem(container._id)}
			>
				<DashboardListItemContainerTitle
					container={container}
					isSelected={isSelected}
					filterQuery={filterQuery}
				/>
				<DashboardListItemButton
					onClick={() => onSelectOrToggleItem(container._id)}
					width={186}
					hideWhenSmallerThan={Display.Desktop}
					tooltipTitle={
						<FormattedMessage id="containers.list.item.revisions.tooltip" defaultMessage="View revisions" />
					}
				>
					<FormattedMessage
						id="containers.list.item.revisions"
						defaultMessage="{count} revisions"
						values={{ count: container.revisionsCount }}
					/>
				</DashboardListItemButton>
				<DashboardListItemText
					selected={isSelected}
					width={160}
				>
					<Highlight search={filterQuery}>
						{container.code}
					</Highlight>
				</DashboardListItemText>
				<DashboardListItemText
					width={188}
					hideWhenSmallerThan={Display.Tablet}
					selected={isSelected}
				>
					<Highlight search={filterQuery}>
						{container.type}
					</Highlight>
				</DashboardListItemText>
				<DashboardListItemText
					width={78}
					selected={isSelected}
				>
					{container.lastUpdated ? formatDate(container.lastUpdated) : ''}
				</DashboardListItemText>
				<DashboardListItemIcon>
					<Tooltip
						title={
							container.isFavourite
								? <FormattedMessage id="containers.list.item.favourite.removeTooltip" defaultMessage="Remove from favourites" />
								: <FormattedMessage id="containers.list.item.favourite.addTooltip" defaultMessage="Add to favourites" />
						}
					>
						<FavouriteCheckbox
							checked={container.isFavourite}
							selected={isSelected}
							onClick={(event) => {
								event.stopPropagation();
							}}
							onChange={(event) => {
								onFavouriteChange(
									container._id,
									!!event.currentTarget.checked,
								);
							}}
						/>
					</Tooltip>
				</DashboardListItemIcon>
				<DashboardListItemIcon selected={isSelected}>
					<ContainerEllipsisMenu
						selected={isSelected}
						container={container}
						onSelectOrToggleItem={onSelectOrToggleItem}
						openShareModal={() => setOpenModal(MODALS.share)}
						openContainerSettings={() => setOpenModal(MODALS.containerSettings)}
					/>
				</DashboardListItemIcon>
			</DashboardListItemRow>
			{isSelected && (
				<RevisionDetails
					containerId={container._id}
					revisionsCount={container.revisionsCount}
					status={container.status}
				/>
			)}
			<ShareModal
				openState={openModal === MODALS.share}
				onClickClose={closeModal}
				title={formatMessage({
					id: 'ShareModal.component.title',
					defaultMessage: 'Share Container URL',
				})}
				containerOrFederation={container}
			/>
			<ContainerSettingsForm
				open={openModal === MODALS.containerSettings}
				container={container}
				onClose={closeModal}
			/>
		</DashboardListItem>
	);
};
