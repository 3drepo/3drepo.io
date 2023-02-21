/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import styled from 'styled-components';
import { Footer } from '@/v4/routes/components/userManagementTab/userManagementTab.styles';
import { Head, Row, Cell } from '@/v4/routes/components/customTable/customTable.styles';
import { SearchField } from '@/v4/routes/components/customTable/components/cellUserSearch/cellUserSearch.styles';
import { DashedContainer } from '@controls/dashedContainer/dashedContainer.component';
import { LoaderContainer } from '@/v4/routes/userManagement/userManagement.styles';

export const NewJobBottomButton = styled(DashedContainer)`
	padding: 23px 0;
	color: ${({ theme }) => theme.palette.primary.main};
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 15px;
	${({ theme }) => theme.typography.h5}
	cursor: pointer;

	&:hover {
		color: ${({ theme }) => theme.palette.primary.dark};
	}

	svg {
		width: 34px;
		height: 34px;
		margin-right: 3px;
	}
`;

export const V5JobsOverrides = styled.div`
	${LoaderContainer} {
		background-color: ${({ theme }) => theme.palette.primary.contrast};
	}

	${Row} {
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		min-height: unset;
	}

	${Cell},
	${SearchField} *,
	.MuiTableSortLabel-icon .MuiTableSortLabel-icon {
		color: ${({ theme }) => theme.palette.base.main};
	}

	${SearchField} input {
		letter-spacing: normal;
	}

	${Head} ${Cell} {
		${({ theme }) => theme.typography.kicker}
	}

	.simplebar-content {
		& > :first-child {
			border-radius: 5px 5px 0 0;
		}
		& > :last-child {
			border-radius: 0 0 5px 5px;
		}
		&:empty {
			display: none;
		}
	}

	.MuiIconButton-root:hover {
		background-color: transparent;
	}

	${Footer} {
		display: none;
	}
`;
