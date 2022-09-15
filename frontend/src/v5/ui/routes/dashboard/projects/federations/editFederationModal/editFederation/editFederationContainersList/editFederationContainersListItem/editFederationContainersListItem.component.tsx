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

import { ComponentType, memo } from 'react';
import { IContainer } from '@/v5/store/containers/containers.types';
import { DashboardListItemButton, DashboardListItemIcon, DashboardListItemText } from '@components/dashboard/dashboardList/dashboardListItem/components';
import { Highlight } from '@controls/highlight';
import { RevisionDetails } from '@components/shared/revisionDetails';
import { Display } from '@/v5/ui/themes/media';
import { formatDate } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import { DashboardListItem } from '@components/dashboard/dashboardList';
import { DashboardListItemContainerTitle } from '@components/dashboard/dashboardList/dashboardListItem/components/dashboardListItemTitle';
import { DashboardListItemRow } from './editFederationContainersListItem.styles';

export type IconButtonProps = {
	container: IContainer;
	isSelected?: boolean;
};

type EditFederationContainersListItemProps = {
	isSelected: boolean;
	container: IContainer;
	filterQuery?: string;
	icon: ComponentType<IconButtonProps>;
	onSelectOrToggleItem: (id: string) => void;
};

export const EditFederationContainersListItem = memo(({
	icon: Icon,
	isSelected,
	container,
	filterQuery,
	onSelectOrToggleItem,
}: EditFederationContainersListItemProps) => (
	<DashboardListItem
		selected={isSelected}
		key={container._id}
	>
		<DashboardListItemRow
			selected={isSelected}
			onClick={() => onSelectOrToggleItem(container._id)}
		>
			<DashboardListItemIcon>
				<Icon container={container} isSelected={isSelected} />
			</DashboardListItemIcon>
			<DashboardListItemContainerTitle
				minWidth={116}
				container={container}
				isSelected={isSelected}
				filterQuery={filterQuery}
				openInNewTab
			/>
			<DashboardListItemButton
				width={186}
				onClick={() => onSelectOrToggleItem(container._id)}
				hideWhenSmallerThan={Display.Desktop}
				tooltipTitle={
					<FormattedMessage id="modal.editFederation.list.item.revisions.tooltip" defaultMessage="View revisions" />
				}
			>
				<FormattedMessage
					id="modal.editFederation.list.item.revisions"
					defaultMessage="{count, plural, =0 {No revisions} one {# revision} other {# revisions}}"
					values={{ count: container.revisionsCount }}
				/>
			</DashboardListItemButton>
			<DashboardListItemText
				width={160}
				selected={isSelected}
			>
				<Highlight search={filterQuery}>
					{container.code}
				</Highlight>
			</DashboardListItemText>
			<DashboardListItemText
				width={160}
				hideWhenSmallerThan={Display.Tablet}
				selected={isSelected}
			>
				<Highlight search={filterQuery}>
					{container.type}
				</Highlight>
			</DashboardListItemText>
			<DashboardListItemText
				width={188}
				selected={isSelected}
			>
				{container.lastUpdated ? formatDate(container.lastUpdated) : ''}
			</DashboardListItemText>
		</DashboardListItemRow>
		{isSelected && (
			<RevisionDetails
				containerId={container._id}
				revisionsCount={container.revisionsCount}
				status={container.status}
			/>
		)}
	</DashboardListItem>
));
