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

import React, { ReactNode } from 'react';
import { useParams } from 'react-router-dom';

import { AppBar } from '@components/shared/appBar';
import { ModalsDispatcher } from '@components/shared/modals';
import { Header as ProjectHeader } from '@/v5/ui/routes/dashboard/projects/header';
import { Content } from './dashboardLayout.styles';

interface IDashboardLayout {
	children: ReactNode;
}

export const DashboardLayout = ({ children }: IDashboardLayout): JSX.Element => {
	const { project } = useParams();
	return (
		<>
			<AppBar />
			{project && <ProjectHeader />}
			<Content>
				{children}
			</Content>
			<ModalsDispatcher />
		</>
	);
};
