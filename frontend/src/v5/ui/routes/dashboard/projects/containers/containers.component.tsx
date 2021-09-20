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

import React, { useState } from 'react';
import { i18n } from '@lingui/core';
import { DashboardListEmptyText } from '@components/dashboard/dashboardList/dasboardList.styles';
import { Trans } from '@lingui/react';
import { MainHeader } from '@controls/mainHeader';
import { SearchInput } from '@controls/searchInput';
import AddCircleIcon from '@assets/icons/add_circle.svg';
import ArrowUpCircleIcon from '@assets/icons/arrow_up_circle.svg';
import { Container, Content, NewContainerButton, NewContainerMainHeaderButton, UploadFileButton } from './containers.styles';
import { ContainersList } from './containersList';

const mockContainers = [];
for (let i = 0; i < 10; i++) {
	const mockContainer = {
		_id: i,
		latestRevision: 123,
		title: 'This is the container title',
		revisionsCount: 7878,
		category: 'my awesome category',
		code: 'XX123',
		date: i18n.date(new Date()),
	};

	mockContainers.push(mockContainer);
}

export const Containers = (): JSX.Element => {
	const [searchInput, setSearchInput] = useState('');

	return (
		<Container>
			<MainHeader>
				<Trans
					id="containers.search.placeholder"
					message="Search containers..."
					render={({ translation }) => (
						<SearchInput
							onClear={() => setSearchInput('')}
							onChange={(event) => setSearchInput(event.currentTarget.value)}
							value={searchInput}
							placeholder={translation as string}
						/>
					)}
				/>
				<NewContainerMainHeaderButton startIcon={<AddCircleIcon />} variant="outlined" color="secondary">
					<Trans id="containers.mainHeader.newContainer" message="New Container" />
				</NewContainerMainHeaderButton>
				<UploadFileButton startIcon={<ArrowUpCircleIcon />} variant="contained" color="primary">
					<Trans id="containers.mainHeader.uploadFile" message="Upload file" />
				</UploadFileButton>
			</MainHeader>
			<Content>
				<ContainersList
					containers={mockContainers}
					title={(
						<Trans
							id="containers.favourites.collapseTitle"
							message="Favourites ({count})"
							values={{ count: mockContainers.length }}
						/>
					)}
					titleTooltips={{
						collapsed: <Trans id="containers.favourites.collapse.tooltip.show" message="Show favourites" />,
						visible: <Trans id="containers.favourites.collapse.tooltip.hide" message="Hide favourites" />,
					}}
					emptyMessage={(
						<DashboardListEmptyText>
							<Trans
								id="containers.favourites.emptyMessage"
								message="You haven’t added any Favourites. Click the star on a container to add your first favourite Container."
							/>
						</DashboardListEmptyText>
					)}
				/>
				<ContainersList
					containers={mockContainers}
					title={(
						<Trans
							id="containers.all.collapseTitle"
							message="All containers ({count})"
							values={{ count: mockContainers.length }}
						/>
					)}
					titleTooltips={{
						collapsed: <Trans id="containers.all.collapse.tooltip.show" message="Show all" />,
						visible: <Trans id="containers.all.collapse.tooltip.hide" message="Hide all" />,
					}}
					emptyMessage={(
						<>
							<DashboardListEmptyText>
								<Trans id="containers.all.emptyMessage" message="You haven’t created any Containers." />
							</DashboardListEmptyText>
							<NewContainerButton startIcon={<AddCircleIcon />}>
								<Trans id="containers.all.newContainer" message="New Container" />
							</NewContainerButton>
						</>
					)}
				/>
			</Content>
		</Container>
	);
};
