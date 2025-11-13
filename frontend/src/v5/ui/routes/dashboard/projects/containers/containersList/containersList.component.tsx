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

import { ReactNode, useCallback, useContext, useState } from 'react';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';
import {
	DashboardList,
	DashboardListCollapse,
	DashboardListEmptyContainer,
	DashboardListEmptySearchResults,
	DashboardListHeader,
	DashboardListHeaderLabel,
} from '@components/dashboard/dashboardList';
import AddCircleIcon from '@assets/icons/filled/add_circle-filled.svg';
import ArrowUpCircleIcon from '@assets/icons/filled/arrow_up_circle-filled.svg';
import { IContainer } from '@/v5/store/containers/containers.types';
import { SearchInput } from '@controls/search/searchInput';
import { Button } from '@controls/button';
import { ContainersHooksSelectors, ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { DEFAULT_SORT_CONFIG, useOrderedList } from '@components/dashboard/dashboardList/useOrderedList';
import { ContainerListItem } from '@/v5/ui/routes/dashboard/projects/containers/containersList/containerListItem';
import { Display } from '@/v5/ui/themes/media';
import { formatMessage } from '@/v5/services/intl';
import { SearchContext, SearchContextType } from '@controls/search/searchContext';
import { CircledNumber } from '@controls/circledNumber/circledNumber.styles';
import { Container, CollapseSideElementGroup } from './containersList.styles';
import { UploadContainerRevisionForm } from '../uploadContainerRevisionForm/uploadContainerRevisionForm.component';
import { ContainerListItemLoading } from './containerListItem/containerListItemLoading.component';
import { VirtualList2 } from '@controls/virtualList/virtualList2.component';

interface IContainersList {
	emptyMessage: ReactNode;
	title: ReactNode;
	titleTooltips: {
		collapsed: ReactNode;
		visible: ReactNode;
	},
	onClickCreate: () => void;
}


export const ContainersList = ({
	emptyMessage,
	title,
	titleTooltips,
	onClickCreate,
}: IContainersList): JSX.Element => {
	const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
	// eslint-disable-next-line max-len
	const { items: containers, filteredItems: filteredContainers } = useContext<SearchContextType<IContainer>>(SearchContext);
	const hasContainers = containers.length > 0;
	const { sortedList, setSortConfig } = useOrderedList(filteredContainers, DEFAULT_SORT_CONFIG);

	const isListPending = ContainersHooksSelectors.selectIsListPending();
	const areStatsPending = ContainersHooksSelectors.selectAreStatsPending();
	const canUpload = ContainersHooksSelectors.selectCanUploadToProject();

	const selectOrToggleItem = useCallback((id: string) => {
		setSelectedItemId((state) => (state === id ? null : id));
	}, []);
	const isProjectAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();

	return (
		<Container>
			<DashboardListCollapse
				title={<>{title} {!isListPending && <CircledNumber>{containers.length}</CircledNumber>}</>}
				tooltipTitles={titleTooltips}
				isLoading={areStatsPending}
				interactableWhileLoading
				sideElement={(
					<CollapseSideElementGroup>
						<SearchInput
							placeholder={formatMessage({ id: 'containers.search.placeholder', defaultMessage: 'Search containers...' })}
						/>
						{ isProjectAdmin && (
							<Button
								startIcon={<AddCircleIcon />}
								variant="outlined"
								color="secondary"
								onClick={onClickCreate}
							>
								<FormattedMessage id="containers.mainHeader.newContainer" defaultMessage="New container" />
							</Button>
						)}
						{ canUpload && (
							<Button
								startIcon={<ArrowUpCircleIcon />}
								variant="contained"
								color="primary"
								onClick={() => DialogsActionsDispatchers.open(UploadContainerRevisionForm)}
							>
								<FormattedMessage id="containers.mainHeader.uploadFiles" defaultMessage="Upload files" />
							</Button>
						)}
					</CollapseSideElementGroup>
				)}
			>
				<DashboardListHeader onSortingChange={setSortConfig} defaultSortConfig={DEFAULT_SORT_CONFIG}>
					<DashboardListHeaderLabel name="name" minWidth={90}>
						<FormattedMessage id="containers.list.header.container" defaultMessage="Container" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="revisionsCount" width={186} hideWhenSmallerThan={Display.Desktop}>
						<FormattedMessage id="containers.list.header.revisions" defaultMessage="Revisions" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="code" width={160}>
						<FormattedMessage id="containers.list.header.containerCode" defaultMessage="Container code" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="type" width={173} hideWhenSmallerThan={Display.Tablet}>
						<FormattedMessage id="containers.list.header.category" defaultMessage="Category" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="lastUpdated" width={120}>
						<FormattedMessage id="containers.list.header.lastUpdated" defaultMessage="Last updated" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="isFavourite" width={90}>
						<FormattedMessage id="containers.list.header.actions" defaultMessage="Actions" />
					</DashboardListHeaderLabel>
				</DashboardListHeader>
				<DashboardList>
					{!isEmpty(sortedList) ? (
						<VirtualList2 items={sortedList} itemHeight={80} ItemComponent={
							(container, index) => (
								container.hasStatsPending ? (
									<ContainerListItemLoading  delay={index / 10} container={container} key={container._id} />
								) : (
									<ContainerListItem
										key={container._id}
										isSelected={container._id === selectedItemId}
										container={container}
										onSelectOrToggleItem={selectOrToggleItem}
									/>
								)
							)
						}/>
					) : (
						<DashboardListEmptyContainer>
							{hasContainers ? (
								<DashboardListEmptySearchResults />
							) : emptyMessage}
						</DashboardListEmptyContainer>
					)}
				</DashboardList>
			</DashboardListCollapse>
		</Container>
	);
};
 
