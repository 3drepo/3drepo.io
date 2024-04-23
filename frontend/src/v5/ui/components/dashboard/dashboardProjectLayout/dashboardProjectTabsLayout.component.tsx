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

import { ReactNode } from 'react';

import { AppBar } from '@components/shared/appBar';
import { ProjectNavigation } from '@components/shared/navigationTabs';
import { Content } from './dashboardProjectLayout.styles';
import { DashboardProjectDataFetcher } from './dashboardProjectDataFetcher.component';

interface IDashboardProjectLayout {
	children: ReactNode;
}

export const DashboardProjectTabsLayout = ({ children }: IDashboardProjectLayout): JSX.Element => (
	<>
		<DashboardProjectDataFetcher />
		<AppBar />
		<ProjectNavigation />
		<Content>
			{children}
		</Content>
	</>
);
