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

export const Tab = styled(MuiTab).attrs({color:'secondary'})`
	${({ theme }) => theme.typography.kicker};
	color: ${({ theme }) => theme.palette.base.main};
	border: 1px solid ${({ theme }) => theme.palette.base.lightest};
	margin-right: -1px;
    margin-left: 0;
    margin-top: 0;
    margin-bottom: 0;
	white-space: nowrap;
	min-height: 0;
	padding: 12px 10px;

	&.Mui-selected {
		color: ${({ theme }) => theme.palette.tertiary.main};
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		border: 1px solid ${({ theme }) => theme.palette.tertiary.main};
		z-index: 1;
	}

	&:first-child {
		border-radius: 5px 0px 0px 5px;
	}

	&:last-child{
		border-radius: 0px 5px 5px 0px;
	}

` as typeof MuiTab;

export const Tabs = styled(MuiTabs)`
	.MuiTabs-indicator {
		display: none;
	}

	margin-bottom: 30px;
`;


export const Container = styled.div`
	${Row} > :nth-child(2) {
		width: 292px;
		min-width: 0;
	}
`;
