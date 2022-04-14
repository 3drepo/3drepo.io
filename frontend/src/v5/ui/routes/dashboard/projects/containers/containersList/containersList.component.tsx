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

import { ReactNode, useState } from 'react';
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
import { IContainer } from '@/v5/store/containers/containers.types';
import { SearchInput } from '@controls/searchInput';
import { Button } from '@controls/button';
import { ContainersHooksSelectors } from '@/v5/services/selectorsHooks/containersSelectors.hooks';
import { ContainersActionsDispatchers } from '@/v5/services/actionsDispatchers/containersActions.dispatchers';
import { DEFAULT_SORT_CONFIG, useOrderedList } from '@components/dashboard/dashboardList/useOrderedList';
import { ContainerListItem } from '@/v5/ui/routes/dashboard/projects/containers/containersList/containerListItem';
import { Display } from '@/v5/ui/themes/media';
import { formatMessage } from '@/v5/services/intl';
import { DashboardListButton, DashedButtonContainer } from '@components/dashboard/dashboardList/dashboardList.styles';
import { Container, CollapseSideElementGroup } from './containersList.styles';

interface IContainersList {
	emptyMessage: ReactNode;
	containers: IContainer[];
	title: ReactNode;
	titleTooltips: {
		collapsed: ReactNode;
		visible: ReactNode;
	},
	hasContainers: boolean;
	showBottomButton?: boolean;
	onFilterQueryChange? : (query: string) => void;
	filterQuery?: string;
	onClickCreate: () => void;
	onClickUpload: () => void;
}

export const ContainersList = ({
	containers,
	emptyMessage,
	title,
	titleTooltips,
	onClickCreate,
	filterQuery,
	onFilterQueryChange,
	onClickUpload,
	hasContainers,
	showBottomButton = false,
}: IContainersList): JSX.Element => {
	const { teamspace, project } = useParams() as { teamspace: string, project: string };
	const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
	const { sortedList, setSortConfig } = useOrderedList(containers, DEFAULT_SORT_CONFIG);

	const isListPending = ContainersHooksSelectors.selectIsListPending();
	const areStatsPending = ContainersHooksSelectors.selectAreStatsPending();

	const selectOrToggleItem = (id: string) => {
		setSelectedItemId((state) => (state === id ? null : id));
	};

	const setFavourite = (id: string, value: boolean) => {
		if (value) {
			ContainersActionsDispatchers.addFavourite(teamspace, project, id);
		} else {
			ContainersActionsDispatchers.removeFavourite(teamspace, project, id);
		}
	};

	return (
		<Container>
			<DashboardListCollapse
				title={<>{title} {!isListPending && `(${containers.length})`}</>}
				tooltipTitles={titleTooltips}
				isLoading={areStatsPending}
				sideElement={(
					<CollapseSideElementGroup>
						<SearchInput
							onClear={() => onFilterQueryChange('')}
							onChange={(event) => onFilterQueryChange(event.currentTarget.value)}
							value={filterQuery}
							placeholder={formatMessage({ id: 'containers.search.placeholder', defaultMessage: 'Search containers...' })}
						/>
						<Button
							startIcon={<AddCircleIcon />}
							variant="outlined"
							color="secondary"
							onClick={onClickCreate}
						>
							<FormattedMessage id="containers.mainHeader.newContainer" defaultMessage="New container" />
						</Button>
						<Button
							startIcon={<ArrowUpCircleIcon />}
							variant="contained"
							color="primary"
							onClick={onClickUpload}
						>
							<FormattedMessage id="containers.mainHeader.uploadFiles" defaultMessage="Upload files" />
						</Button>
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
					<DashboardListHeaderLabel name="type" width={160} hideWhenSmallerThan={Display.Tablet}>
						<FormattedMessage id="containers.list.header.category" defaultMessage="Category" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="lastUpdated" width={188}>
						<FormattedMessage id="containers.list.header.lastUpdated" defaultMessage="Last updated" />
					</DashboardListHeaderLabel>
				</DashboardListHeader>
				<DashboardList>
					{!isEmpty(sortedList) ? (
						sortedList.map((container, index) => (
							<ContainerListItem
								index={index}
								key={container._id}
								isSelected={container._id === selectedItemId}
								container={container}
								filterQuery={filterQuery}
								onFavouriteChange={setFavourite}
								onSelectOrToggleItem={selectOrToggleItem}
							/>
						))
					) : (
						<DashboardListEmptyContainer>
							{filterQuery && hasContainers ? (
								<DashboardListEmptySearchResults searchPhrase={filterQuery} />
							) : emptyMessage}
						</DashboardListEmptyContainer>
					)}
				</DashboardList>
				{showBottomButton && !isListPending && hasContainers && (
					<DashedButtonContainer>
						<DashboardListButton
							startIcon={<AddCircleIcon />}
							onClick={onClickCreate}
						>
							<FormattedMessage id="containers.addContainerButton" defaultMessage="Add new Container" />
						</DashboardListButton>
					</DashedButtonContainer>
				)}

			</DashboardListCollapse>
		</Container>
	);
};
