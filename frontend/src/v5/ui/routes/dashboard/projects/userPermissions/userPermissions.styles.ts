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
import { Row } from '@/v4/routes/components/customTable/customTable.styles';
import styled from 'styled-components';
import { Tab as MuiTab, Tabs as MuiTabs } from '@material-ui/core';
import { ProjectsPermissions } from '@/v4/routes/projects/projectsPermissions';
import { ModelsPermissions } from '@/v4/routes/modelsPermissions';
import { ModelsContainer } from '@/v4/routes/modelsPermissions/modelsPermissions.styles';
import { Container as TextOverlay } from '@/v4/routes/components/textOverlay/textOverlay.styles';

export const Tab = styled(MuiTab)`
	${({ theme }) => theme.typography.kicker};
	color: ${({ theme }) => theme.palette.base.main};
	border: 1px solid ${({ theme }) => theme.palette.base.lightest};
	margin: 0 -1px 0 0;
	white-space: nowrap;
	min-height: 0;
	padding: 12px 17px;

	&.Mui-selected {
		color: ${({ theme }) => theme.palette.tertiary.main};
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		border: 1px solid ${({ theme }) => theme.palette.tertiary.main};
		z-index: 1;
	}

	&:first-child {
		border-radius: 5px 0 0 5px;
	}

	&:last-child{
		border-radius: 0 5px 5px 0;
	}
` as typeof MuiTab;

export const Tabs = styled(MuiTabs)`
	.MuiTabs-indicator {
		display: none;
	}

	margin-top: 10px;
	margin-bottom: 30px;
`;

export const V4ProjectsPermissions = styled(ProjectsPermissions)`
	${Row} > :nth-child(2) {
		width: 292px;
		min-width: 0;
	}
`;

export const V4ModelsPermissions = styled(ModelsPermissions)`
	${ModelsContainer} {
		border: 0;
		margin-right: 30px;
	}

	${TextOverlay} {
		background: rgba(255, 255, 255, 0.89);
		${({ theme }) => theme.typography.h4};
		color: ${({ theme }) => theme.palette.secondary.main};
	}
`;

export const Container = styled.div`
	padding-top: 5px;
`;
