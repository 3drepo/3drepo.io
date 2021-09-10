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
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { MuiThemeProvider, StylesProvider } from '@material-ui/core';
import { theme } from '@/v5/ui/themes/theme';
import { GlobalStyle } from '@/v5/ui/themes/global';

import { AppBar } from '@components/shared/appBar';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { messages as enMessages } from '@/locales/en/messages';
import { messages as esMessages } from '@/locales/es/messages';
import { DashboardList, DashboardListHeader, DashboardListHeaderLabel } from '@components/dashboard/dashboardList';
import { DashboardListItem } from '@components/dashboard/dashboardList/dashboardListItem';
import {
	DashboardListItemButton,
	DashboardListItemIcon,
	DashboardListItemRow,
	DashboardListItemText,
	DashboardListItemTitle,
} from '@components/dashboard/dashboardList/dashboardListItem/components';

import EllipsisIcon from '@assets/icons/chevron.svg';
import { DashboardListCollapse } from '@components/dashboard/dashboardList/dashboardListCollapse';
import { SortingDirection } from '@components/dashboard/dashboardList/dashboardList.types';
import { FavouriteCheckbox } from '@controls/favouriteCheckbox';
import { Content } from './mainLayout.styles';

i18n.load('en', enMessages);
i18n.load('es', esMessages);

i18n.activate('en');

const containerD = {
	latestRevision: 123,
	title: 'This is the container title',
	revisionsCount: 7878,
	category: 'my awesome category',
	code: 'XX123',
	date: i18n.date(new Date()),
};

const containers = [];

for (let i = 0; i < 10; i++) {
	containers.push(containerD);
}

const ContainerListItem = ({
	container,
	selected,
}) => (
	<DashboardListItemRow>
		<DashboardListItemTitle
			subtitle={`Latest revision ${container.latestRevision}`}
			selected={selected}
			tooltipTitle="Title tooltip"
		>
			{container.title}
		</DashboardListItemTitle>
		<DashboardListItemButton
			onClick={() => {
			}}
			width={150}
			tooltipTitle="View revisions"
		>
			{`${container.revisionsCount} revisions`}
		</DashboardListItemButton>
		<DashboardListItemText width={130} selected={selected}>{container.code}</DashboardListItemText>
		<DashboardListItemText width={160} selected={selected}>{container.category}</DashboardListItemText>
		<DashboardListItemText width={100} selected={selected}>{container.date}</DashboardListItemText>
		<DashboardListItemIcon><FavouriteCheckbox /></DashboardListItemIcon>
		<DashboardListItemIcon><EllipsisIcon /></DashboardListItemIcon>
	</DashboardListItemRow>
);

export const MainLayout = (): JSX.Element => (
	<I18nProvider i18n={i18n}>
		<ThemeProvider theme={theme}>
			<MuiThemeProvider theme={theme}>
				<StylesProvider injectFirst>
					<GlobalStyle />
					<AppBar />
					<Content>
						<DashboardListCollapse
							title="All Containers(11)"
							tooltipTitles={{
								collapsed: 'Show list',
								visible: 'Hide list',
							}}
						>
							<DashboardListHeader>
								<DashboardListHeaderLabel sortingDirection={SortingDirection.ASCENDING} sort>
									Container
								</DashboardListHeaderLabel>
								<DashboardListHeaderLabel width={150} sort>Revisions</DashboardListHeaderLabel>
								<DashboardListHeaderLabel width={130} sort>Container code</DashboardListHeaderLabel>
								<DashboardListHeaderLabel width={160} sort>Category</DashboardListHeaderLabel>
								<DashboardListHeaderLabel width={194} sort>Last Updated</DashboardListHeaderLabel>
							</DashboardListHeader>
							<DashboardList>
								{containers.map((container, i) => (
									<DashboardListItem selected={i === 3}>
										<ContainerListItem container={container} selected={i === 3} />
									</DashboardListItem>
								))}
							</DashboardList>
						</DashboardListCollapse>
					</Content>
				</StylesProvider>
			</MuiThemeProvider>
		</ThemeProvider>
	</I18nProvider>
);
