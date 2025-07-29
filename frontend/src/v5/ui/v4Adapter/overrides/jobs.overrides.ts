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
import styled, { css } from 'styled-components';
import { Footer, Container } from '@/v4/routes/components/userManagementTab/userManagementTab.styles';
import { Head, Row, Cell } from '@/v4/routes/components/customTable/customTable.styles';
import { SearchField } from '@/v4/routes/components/customTable/components/cellUserSearch/cellUserSearch.styles';
import { LoaderContainer } from '@/v4/routes/userManagement/userManagement.styles';
import { FloatingButtonContainer } from '@/v4/routes/components/floatingActionPanel/floatingActionPanel.styles';
import { ColorSelect } from '@/v4/routes/components/colorPicker/colorPicker.styles';
import { primaryButtonStyling } from '../resuableOverrides.styles';

export const V5JobsOverrides = styled.div<{ isAdmin: boolean }>`
	position: relative;

	${Container} {
		height: unset;
		background-color: transparent;
	}

	${LoaderContainer} {
		background-color: ${({ theme }) => theme.palette.primary.contrast};
	}

	.simplebar-track.simplebar-horizontal,
	.simplebar-track.simplebar-vertical {
		height: 0;
	}

	${FloatingButtonContainer} {
		top: 0;
		right: 0;

		button {
			margin: 8px 0 8px 8px;
			border: 0;
			border-radius: 6px;
			width: fit-content;
			padding: 8px 16px;
			text-transform: none;
			font-size: 12px;
			height: 35px;
			min-height: 35px;
			color: ${({ theme }) => theme.palette.primary.contrast};

			${({ isAdmin }) => {
				if (isAdmin) return primaryButtonStyling;
				return css`
					pointer-events: none;
					cursor: default;
					background-color: ${({ theme }) => theme.palette.base.lightest};
				`;
			}}

			svg {
				margin-right: 10px;
			}
		}
	}

	// columns headers
	${Row} {
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		min-height: unset;
	}

	${Head} svg,
	${Head} ${Cell},
	${SearchField} *,
	.MuiTableSortLabel-icon .MuiTableSortLabel-icon {
		color: ${({ theme }) => theme.palette.base.main};
	}

	${SearchField}${SearchField} {
		.search-field__label {
			margin-top: 15px;
		}

		input {
			letter-spacing: normal;
		}
	}

	${Head}${Head} {
		min-height: unset;
		height: 40px;
		background-color: transparent;

		${Cell} {
			${({ theme }) => theme.typography.kicker}
			padding: 0;

			&:nth-of-type(2) {
				margin-left: 25px;
			}
		}
	}

	// row items
	.simplebar-content {
		${Cell} {
			color: ${({ theme }) => theme.palette.secondary.main};
			${({ theme }) => theme.typography.h5}
		}
		& > :first-child {
			border-top-left-radius: 10px;
			border-top-right-radius: 10px;
		}
		& > :last-child {
			border-bottom-left-radius: 10px;
			border-bottom-right-radius: 10px;
			border: none;
		}
		&:empty {
			display: none;
		}

		${({ isAdmin }) => !isAdmin && css`
			${ColorSelect} {
				background-color: transparent;
				pointer-events: none;
				cursor: default;

				svg {
					display: none;
				}
			}
		`}
	}

	// delete button
	${/* sc-selector */Cell}:last-of-type {
		svg {
			width: 15px;
		}

		.MuiIconButton-root {
			${({ isAdmin }) => !isAdmin && css`
				color: ${({ theme }) => theme.palette.base.lightest};
				pointer-events: none;
				cursor: default;
			`}
		
			&:hover {
				background-color: transparent;
			}
		}
	}

	${Footer} {
		display: none;
	}
`;
