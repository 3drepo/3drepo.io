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

import { ReactNode, ComponentType, useState, useContext } from 'react';
import {
	DashboardList,
	DashboardListCollapse,
	DashboardListEmptySearchResults,
	DashboardListHeaderLabel,
	DashboardListEmptyContainer,
	DashboardListHeader } from '@components/dashboard/dashboardList';
import { formatMessage } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import { SearchInput } from '@controls/search/searchInput';
import { Display } from '@/v5/ui/themes/media';
import { DEFAULT_SORT_CONFIG, useOrderedList } from '@components/dashboard/dashboardList/useOrderedList';
import { IContainer } from '@/v5/store/containers/containers.types';
import { ButtonProps } from '@mui/material/Button';
import { isEmpty } from 'lodash';
import { ContainersHooksSelectors } from '@/v5/services/selectorsHooks/containersSelectors.hooks';
import { CollapseSideElementGroup } from '@/v5/ui/routes/dashboard/projects/containers/containersList/containersList.styles';
import { SearchContext, SearchContextType } from '@controls/search/searchContext';
import { EditFederationContainersListItem } from './editFederationContainersListItem/editFederationContainersListItem.component';
import { Container } from './editFederationContainersList.styles';

export type ActionButtonProps = {
	children: ReactNode;
	disabled?: boolean;
	filteredContainers?: IContainer[];
};

export type IconButtonProps = {
	container: IContainer;
	isSelected?: boolean;
};

type EditFederationContainersProps = {
	title: string;
	collapsableTooltips?: {
		visible: ReactNode;
		collapsed: ReactNode;
	},
	emptyListMessage: ReactNode;
	actionButton: ComponentType<ActionButtonProps>;
	actionButtonTexts: ButtonProps & {
		allResults: ReactNode;
		filteredResults: ReactNode;
	};
	iconButton: ComponentType<IconButtonProps>;
};

export const EditFederationContainers = ({
	title,
	collapsableTooltips,
	emptyListMessage,
	actionButton: ActionButton,
	actionButtonTexts,
	iconButton: IconButton,
}: EditFederationContainersProps) => {
	const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
	const { items: containers, filteredItems, query } = useContext<SearchContextType<IContainer>>(SearchContext);
	const hasContainers = containers.length > 0;

	const { sortedList, setSortConfig } = useOrderedList(
		filteredItems,
		DEFAULT_SORT_CONFIG,
	);

	const isListPending = ContainersHooksSelectors.selectIsListPending();
	const areStatsPending = ContainersHooksSelectors.selectAreStatsPending();

	const selectOrToggleItem = (id: string) => {
		setSelectedItemId((state) => (state === id ? null : id));
	};

	return (
		<Container>
			<DashboardListCollapse
				title={<>{title} {!isListPending && `(${sortedList.length})`}</>}
				isLoading={areStatsPending}
				tooltipTitles={collapsableTooltips}
				sideElement={(
					<CollapseSideElementGroup>
						<ActionButton disabled={isEmpty(containers)} filteredContainers={sortedList}>
							{isEmpty(query)
								? actionButtonTexts.allResults
								: actionButtonTexts.filteredResults}
						</ActionButton>
						<SearchInput
							placeholder={formatMessage({ id: 'modal.editFederation.search.placeholder', defaultMessage: 'Search containers...' })}
						/>
					</CollapseSideElementGroup>
				)}
			>
				<DashboardListHeader onSortingChange={setSortConfig} defaultSortConfig={DEFAULT_SORT_CONFIG}>
					<DashboardListHeaderLabel name="name" minWidth={116}>
						<FormattedMessage id="modal.editFederation.list.header.container" defaultMessage="Container" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="revisionsCount" width={186} hideWhenSmallerThan={Display.Desktop}>
						<FormattedMessage id="modal.editFederation.list.header.revisions" defaultMessage="Revisions" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="code" width={160}>
						<FormattedMessage id="modal.editFederation.list.header.containerCode" defaultMessage="Container code" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="type" width={160} hideWhenSmallerThan={Display.Tablet}>
						<FormattedMessage id="modal.editFederation.list.header.category" defaultMessage="Category" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="lastUpdated" width={188}>
						<FormattedMessage id="modal.editFederation.list.header.lastUpdated" defaultMessage="Last updated" />
					</DashboardListHeaderLabel>
				</DashboardListHeader>
				<DashboardList>
					{!isEmpty(sortedList) ? (
						sortedList.map((container, index) => (
							<EditFederationContainersListItem
								index={index}
								icon={() => (
									<IconButton container={container} isSelected={container._id === selectedItemId} />
								)}
								key={container._id}
								isSelected={container._id === selectedItemId}
								container={container}
								filterQuery={query}
								onSelectOrToggleItem={selectOrToggleItem}
							/>
						))
					) : (
						<DashboardListEmptyContainer>
							{ hasContainers ? (
								<DashboardListEmptySearchResults />
							) : emptyListMessage}
						</DashboardListEmptyContainer>
					)}
				</DashboardList>
			</DashboardListCollapse>
		</Container>
	);
};
