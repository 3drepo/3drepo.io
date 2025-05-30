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

import { Cell, Head, Row } from '@/v4/routes/components/customTable/customTable.styles';
import { FloatingButton, FloatingButtonContainer } from '@/v4/routes/components/floatingActionPanel/floatingActionPanel.styles';
import { Content as LoadingText } from '@/v4/routes/components/loader/loader.styles';
import { Container as UserTable, Footer as LicencesFooter } from '@/v4/routes/components/userManagementTab/userManagementTab.styles';
import { LoaderContainer } from '@/v4/routes/userManagement/userManagement.styles';
import { PendingInvites } from '@/v4/routes/users/users.styles';
import styled, { css } from 'styled-components';

const AddUserButton = css`
	${FloatingButtonContainer} {
		top: 26px;
		height: 35px;
		right: 0;
		${FloatingButton} {
			::after {
				content: 'Add user';
				${({ theme }) => theme.typography.body1};
				margin-left: 8px;
			}
			border-radius: 8px;
			width: auto;
			text-transform: none;
			padding: 8px 16px;
			margin: 0;
			background-color: ${({ theme }) => theme.palette.primary.main};
			color: ${({ theme }) => theme.palette.primary.contrast};
			border: none;
			&:hover {
				background-color: ${({ theme }) => theme.palette.primary.dark};
			}
			&:disabled {
				background-color: ${({ theme }) => theme.palette.base.lightest};
				svg {
					color: ${({ theme }) => theme.palette.base.lightest};
				}
			}
			svg {
				border-radius: 50%;
				color: ${({ theme }) => theme.palette.primary.main};
				background-color: ${({ theme }) => theme.palette.primary.contrast};
				height: 13px;
				width: 13px;
				padding: 2px;
			}
		}
	}
`;

const SelectStyles = css`
	.MuiInputBase-root {
		width: 100%;
		svg { /* Chevron icon */
			top: 15px;
		}
		.MuiSelect-select {
			padding-left: 10px;
			width: 100%;
			&, .MuiGrid-root {
				${({ theme }) => theme.typography.body1};
				line-height: 35px;
				color: ${({ theme }) => theme.palette.secondary.main};
			}

			.MuiGrid-root {
				width: auto;
			}
		}
	}
`;

const UserCell = `${Row}>:nth-child(1)`;
const JobCell = `${Row}>:nth-child(2)`;
const PermissionsCell = `${Row}>:nth-child(3)`;
const BlankCell = `${Row}>:nth-child(4)`;
const RemoveUserCell = `${Row}>:nth-child(5)`;

export const V5UserListOverrides = styled.div`
	position: relative;
	margin: 0;
	${AddUserButton}
	${LoaderContainer} {
		background-color: transparent;
		margin-top: 80px;
		${LoadingText} {
			color: ${({ theme }) => theme.palette.secondary.light}
		}
	}
	${UserTable}{
		background-color: transparent;
		height: unset;
		${Head} {
			min-height: unset;
			height: 40px;
			align-items: flex-end;
			${Cell} {
				height: 100%;
				padding-top: 0;
				:first-child {
					padding-left: 0;
				}
				.search-field__label {
					margin-top: 15px;
				}
			}
		}

		${UserCell} {
			padding-left: 20px;
			max-width: calc(46% - 60px);
		}
		${JobCell} {
			max-width: 27%;
			padding: 0 10px 0 0;
			${SelectStyles} {
				.MuiGrid-container {
					flex-wrap: nowrap;
					.MuiGrid-item:first-of-type {
						min-height: 10px;
						min-width: 10px;
					}
				}
			}
		}
		${PermissionsCell} {
			padding: 0 0 0 10px;
			max-width: 27%;
			${SelectStyles}
		}
		${BlankCell} {
			display: none;
		}
		${RemoveUserCell} {
			max-width: 60px;
			padding: 0;
			justify-content: center;

			.MuiIconButton-root {
				padding: 0;
				&:not(.Mui-disabled) {
					color: ${({ theme }) => theme.palette.secondary.main};
				}
			}
		}

		${Row} {
			border-color: ${({ theme }) => theme.palette.secondary.lightest};
			&:last-of-type {
				border: none;
			}
		}
	}

	// delete button
	${/* sc-selector */Cell}:last-of-type {
		svg {
			width: 15px;
		}

		.MuiIconButton-root:hover {
			background-color: transparent;
		}
	}
	
	${LicencesFooter} {
		${({ theme }) => theme.typography.body1};
		color: ${({ theme }) => theme.palette.base.main};
		border: none;
		padding: 10px 0;
		align-items: baseline;
		height: 26px;
		${PendingInvites} {
			cursor: pointer;
			margin: 0;
			text-decoration: none;
			color: ${({ theme }) => theme.palette.primary.main};
			&:hover {
				text-decoration: underline;
				color: ${({ theme }) => theme.palette.primary.dark};
			}
		}
	}
`;
