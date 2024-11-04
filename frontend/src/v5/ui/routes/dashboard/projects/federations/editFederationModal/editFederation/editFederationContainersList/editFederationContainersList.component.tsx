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

import { ReactNode, ComponentType, useState, useContext, useCallback } from 'react';
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
import { ContainersHooksSelectors } from '@/v5/services/selectorsHooks';
import { CollapseSideElementGroup } from '@/v5/ui/routes/dashboard/projects/containers/containersList/containersList.styles';
import { SearchContext, SearchContextType } from '@controls/search/searchContext';
import { EditFederationContainersListItem, IconButtonProps } from './editFederationContainersListItem/editFederationContainersListItem.component';
import { Container, ContainerListMainTitle, ContainerCount } from './editFederationContainersList.styles';
import { VirtualList } from '@controls/virtualList/virtualList.component';
import { EditFederationContainersListItemLoading } from './editFederationContainersListItem/editFederationContainersListItemLoading.component';

export type ActionButtonProps = {
	children: ReactNode;
	disabled?: boolean;
	filteredContainersIds?: string[];
};

type EditFederationContainersProps = {
	isIncluded?: boolean;
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
	isIncluded,
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

	const selectOrToggleItem = useCallback((id: string) => {
		setSelectedItemId((state) => (state === id ? null : id));
	}, []);

	return (
		<Container>
			<DashboardListCollapse
				title={(
					<>
						<ContainerListMainTitle>{title}</ContainerListMainTitle>
						{!isListPending && <ContainerCount>({sortedList.length})</ContainerCount>}
					</>
				)}
				interactableWhileLoading
				isLoading={areStatsPending}
				tooltipTitles={collapsableTooltips}
				sideElement={(
					<CollapseSideElementGroup>
						<ActionButton disabled={isEmpty(containers)} filteredContainersIds={sortedList.map((c) => c._id)}>
							{!query.length
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
					<DashboardListHeaderLabel name="revisionsCount" width={170} hideWhenSmallerThan={Display.Desktop}>
						<FormattedMessage id="modal.editFederation.list.header.revisions" defaultMessage="Revisions" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="code" width={160}>
						<FormattedMessage id="modal.editFederation.list.header.containerCode" defaultMessage="Container code" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="group" width={160}>
						<FormattedMessage id="modal.editFederation.list.header.group" defaultMessage="Group" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="type" width={160} hideWhenSmallerThan={Display.Tablet}>
						<FormattedMessage id="modal.editFederation.list.header.category" defaultMessage="Category" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="lastUpdated" width={140}>
						<FormattedMessage id="modal.editFederation.list.header.lastUpdated" defaultMessage="Last updated" />
					</DashboardListHeaderLabel>
				</DashboardListHeader>
				<DashboardList>

					{!isEmpty(sortedList) ? (
						<VirtualList items={sortedList} itemHeight={81} itemContent={
							(container, index) => (
								container.hasStatsPending ? (
									<EditFederationContainersListItemLoading  index={index} container={container} key={container._id} />
								) : (
									<EditFederationContainersListItem
										icon={IconButton}
										key={container._id}
										isSelected={container._id === selectedItemId}
										container={container}
										filterQuery={query}
										onItemClick={selectOrToggleItem}
										isIncluded={isIncluded}
									/>
								)
							)
						}/>
					) : (
						<DashboardListEmptyContainer>
							{hasContainers ? (
								<DashboardListEmptySearchResults />
							) : emptyListMessage}
						</DashboardListEmptyContainer>
					)}
				</DashboardList>
			</DashboardListCollapse>
		</Container>
	);
};
