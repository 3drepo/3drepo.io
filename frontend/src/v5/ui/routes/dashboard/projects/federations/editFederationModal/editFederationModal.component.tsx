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

import React, { ReactNode, useState, useEffect } from 'react';
import { useParams } from 'react-router';
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
import AddCircleIcon from '@assets/icons/add_circle.svg';
import ArrowUpCircleIcon from '@assets/icons/arrow_up_circle.svg';
import { HeaderButtonsGroup } from '@/v5/ui/routes/dashboard/projects/containers/containers.styles';
import { IContainer } from '@/v5/store/containers/containers.types';
import { SearchInput } from '@controls/searchInput';
import { Button } from '@controls/button';
import { ContainersHooksSelectors } from '@/v5/services/selectorsHooks/containersSelectors.hooks';
import { ContainersActionsDispatchers } from '@/v5/services/actionsDispatchers/containersActions.dispatchers';
import { DEFAULT_SORT_CONFIG, useOrderedList } from '@components/dashboard/dashboardList/useOrderedList';
import { ContainerListItem } from '@/v5/ui/routes/dashboard/projects/containers/containersList/containerListItem';
import { Display } from '@/v5/ui/themes/media';
import { formatMessage } from '@/v5/services/intl';
import { DashboardListButton } from '@components/dashboard/dashboardList/dashboardList.styles';
import { IFederation } from '@/v5/store/federations/federations.types';
import { FormModal, Container, CollapseSideElementGroup } from './editFederationModal.styles';
import { DashboardListEmptyText } from '@components/dashboard/dashboardList/dashboardList.styles';
import { Divider } from '@components/dashboard/dashboardList/dashboardList.styles';

type IEditFederationModal = {
	openState: boolean;
	federation: IFederation;
	// titleTooltips: {
	// 	collapsed: ReactNode;
	// 	visible: ReactNode;
	// },
	// showBottomButton?: boolean;
	filterQuery?: string;
	onFilterQueryChange?: (query: string) => void;
};

export const EditFederationModal = ({
	openState,
	federation,
	// containers,
	// emptyMessage,
	// titleTooltips,
	filterQuery,
	onFilterQueryChange,
	// hasContainers,
	// showBottomButton = false,
}: IEditFederationModal): JSX.Element => {
	const containers = [];
	const { teamspace, project } = useParams() as { teamspace: string, project: string };
	const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

	const isListPending = ContainersHooksSelectors.selectIsListPending();
	const areStatsPending = ContainersHooksSelectors.selectAreStatsPending();
	const { sortedList, setSortConfig } = useOrderedList(containers, DEFAULT_SORT_CONFIG);
	const [includedContainers, setIncludedContainers] = useState<IContainer[]>();

	const getAvailableContainers = () => sortedList.filter((container) => !includedContainers.includes(container));

	useEffect(() => {
		// containers = ContainersHooksSelectors.selectContainers();
	}, [openState]);

	return (
		<FormModal
			open={openState}
			title={formatMessage({
				id: 'modal.editFederation.title',
				defaultMessage: 'Edit {federationName}',
			}, { federationName: federation.name })}
			confirmLabel={formatMessage({ id: 'modal.editFederation.confirm', defaultMessage: 'Save Changes' })}
		>
			<Container>
				<DashboardListCollapse
					title={(
						<>{
							formatMessage({
								id: 'modal.editFederation.containers.title',
								defaultMessage: 'Containers included in {federationName}',
							}, { federationName: federation.name })
						} {!isListPending && `(${includedContainers.length})`}
						</>
					)}
					tooltipTitles={{
						collapsed: <FormattedMessage id="modal.editFederation.included.collapse.tooltip.show" defaultMessage="Show included federations" />,
						visible: <FormattedMessage id="modal.editFederation.included.collapse.tooltip.hide" defaultMessage="Hide included federations" />,
					}}
					isLoading={areStatsPending}
					sideElement={(
						<CollapseSideElementGroup>
							<HeaderButtonsGroup>
								<Button
									variant="outlined"
									color="error"
								>
									<FormattedMessage id="modal.editFederation.included.removeAll" defaultMessage="Remove All" />
								</Button>
							</HeaderButtonsGroup>
							<SearchInput
								onClear={() => onFilterQueryChange('')}
								onChange={(event) => onFilterQueryChange(event.currentTarget.value)}
								value={filterQuery}
								placeholder={formatMessage({ id: 'modal.editFederation.included.search.placeholder', defaultMessage: 'Search containers...' })}
							/>
						</CollapseSideElementGroup>
					)}
				>
					<DashboardListHeader onSortingChange={setSortConfig} defaultSortConfig={DEFAULT_SORT_CONFIG}>
						<DashboardListHeaderLabel name="name">
							<FormattedMessage id="containers.list.header.container" defaultMessage="Container" />
						</DashboardListHeaderLabel>
						<DashboardListHeaderLabel name="revisionsCount" width={186} hideWhenSmallerThan={Display.Desktop}>
							<FormattedMessage id="containers.list.header.revisions" defaultMessage="Revisions" />
						</DashboardListHeaderLabel>
						<DashboardListHeaderLabel name="code" minWidth={112}>
							<FormattedMessage id="containers.list.header.containerCode" defaultMessage="Container code" />
						</DashboardListHeaderLabel>
						<DashboardListHeaderLabel name="type" width={188} hideWhenSmallerThan={Display.Tablet}>
							<FormattedMessage id="containers.list.header.category" defaultMessage="Category" />
						</DashboardListHeaderLabel>
						<DashboardListHeaderLabel name="lastUpdated" width={160}>
							<FormattedMessage id="containers.list.header.lastUpdated" defaultMessage="Last updated" />
						</DashboardListHeaderLabel>
					</DashboardListHeader>
					<DashboardList>
						{!isEmpty(includedContainers) ? (
							includedContainers.map((container, index) => (
								<ContainerListItem
									index={index}
									key={container._id}
									isSelected={container._id === selectedItemId}
									container={container}
									filterQuery={filterQuery}
								/>
							))
						) : (
							<DashboardListEmptyContainer>
								{filterQuery && includedContainers.length > 0 ? (
									<DashboardListEmptySearchResults searchPhrase={filterQuery} />
								) : (
									<DashboardListEmptyText>
										<FormattedMessage
											id="modal.editFederation.included.emptyMessage"
											defaultMessage="You haven’t added any Containers to this Federation. Add Federations from the list of Containers below."
										/>
									</DashboardListEmptyText>
								)}
							</DashboardListEmptyContainer>
						)}
					</DashboardList>
				</DashboardListCollapse>
			</Container>
			<Divider />
			<Container>
				<DashboardListCollapse
					title={(
						<>{
							formatMessage({
								id: 'modal.editFederation.containers.title',
								defaultMessage: 'Available containers',
							})
						} {!isListPending && `(${getAvailableContainers().length})`}
						</>
					)}
					tooltipTitles={{
						collapsed: <FormattedMessage id="modal.editFederation.available.collapse.tooltip.show" defaultMessage="Show available containers" />,
						visible: <FormattedMessage id="modal.editFederation.available.collapse.tooltip.hide" defaultMessage="Hide available containers" />,
					}}
					isLoading={areStatsPending}
					sideElement={(
						<CollapseSideElementGroup>
							<HeaderButtonsGroup>
								<Button
									variant="outlined"
									color="primary"
								>
									<FormattedMessage id="modal.editFederation.included.addAll" defaultMessage="Add All" />
								</Button>
							</HeaderButtonsGroup>
							<SearchInput
								onClear={() => onFilterQueryChange('')}
								onChange={(event) => onFilterQueryChange(event.currentTarget.value)}
								value={filterQuery}
								placeholder={formatMessage({ id: 'modal.editFederation.included.search.placeholder', defaultMessage: 'Search containers...' })}
							/>
						</CollapseSideElementGroup>
					)}
				>
					<DashboardListHeader onSortingChange={setSortConfig} defaultSortConfig={DEFAULT_SORT_CONFIG}>
						<DashboardListHeaderLabel name="name">
							<FormattedMessage id="containers.list.header.container" defaultMessage="Container" />
						</DashboardListHeaderLabel>
						<DashboardListHeaderLabel name="revisionsCount" width={186} hideWhenSmallerThan={Display.Desktop}>
							<FormattedMessage id="containers.list.header.revisions" defaultMessage="Revisions" />
						</DashboardListHeaderLabel>
						<DashboardListHeaderLabel name="code" minWidth={112}>
							<FormattedMessage id="containers.list.header.containerCode" defaultMessage="Container code" />
						</DashboardListHeaderLabel>
						<DashboardListHeaderLabel name="type" width={188} hideWhenSmallerThan={Display.Tablet}>
							<FormattedMessage id="containers.list.header.category" defaultMessage="Category" />
						</DashboardListHeaderLabel>
						<DashboardListHeaderLabel name="lastUpdated" width={160}>
							<FormattedMessage id="containers.list.header.lastUpdated" defaultMessage="Last updated" />
						</DashboardListHeaderLabel>
					</DashboardListHeader>
					<DashboardList>
						{!isEmpty(getAvailableContainers()) ? (
							getAvailableContainers().map((container, index) => (
								<ContainerListItem
									index={index}
									key={container._id}
									isSelected={container._id === selectedItemId}
									container={container}
									filterQuery={filterQuery}
								/>
							))
						) : (
							<DashboardListEmptyContainer>
								{filterQuery && getAvailableContainers().length > 0 ? (
									<DashboardListEmptySearchResults searchPhrase={filterQuery} />
								) : (
									<DashboardListEmptyText>
										<FormattedMessage
											id="modal.editFederation.available.emptyMessage"
											defaultMessage="You don’t have any available Containers."
										/>
									</DashboardListEmptyText>
								)}
							</DashboardListEmptyContainer>
						)}
					</DashboardList>
				</DashboardListCollapse>
			</Container>
		</FormModal>
	);
};
