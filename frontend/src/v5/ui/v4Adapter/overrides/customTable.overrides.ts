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

import { BodyWrapper as CustomTableBody, Cell, Head, Row } from '@/v4/routes/components/customTable/customTable.styles';
import { css } from 'styled-components';
import { Name as UserNameCell } from '@/v4/routes/components/userItem/userItem.styles';
import { SortLabel } from '@/v4/routes/components/customTable/components/tableHeading/tableHeading.styles';
import { PermissionsCellContainer } from '@/v4/routes/components/permissionsTable/permissionsTable.styles';
import { RadioContainer as TableHeadingRadioContainer, TableHeadingRadioButton, TableHeadingRadioTooltip } from '@/v4/routes/components/customTable/components/tableHeadingRadio/tableHeadingRadio.styles';
import { SearchField } from '@/v4/routes/components/customTable/components/cellUserSearch/cellUserSearch.styles';

// all the .simplebar-... stuff is to disable simplebar
export default css`
	${CustomTableBody} {
		position: relative;
		height: auto;
		background: transparent;

		div {
			position: relative;
		}

		.simplebar-content {
			border-radius: 10px;
			background-color: ${({ theme }) => theme.palette.primary.contrast};

			& > * {
				border-color: ${({ theme }) => theme.palette.tertiary.lightest};
			}
		}

		.simplebar-content-wrapper {
			height: auto !important;
			max-height: initial;
		}

		.simplebar-placeholder {
			display: none;
		}
	}

	${Head} {
		border: 0;

		${Cell} {
			padding-top: 22px;
		}
	}
	
	${UserNameCell} {
		${({ theme }) => theme.typography.h5};
		color: ${({ theme }) => theme.palette.secondary.main};
	}

	${Row} {
		min-height: 80.7px;
		&:last-child {
			border: none;
		}
	}

	${SortLabel} {
		margin: 0;
		padding: 0;
		${({ theme }) => theme.typography.kicker};
		flex-direction: row;
		svg {
			width: 10px;
			margin-left: 2px;
		}

		&::before {
			background: transparent;
		}

		&.MuiTableSortLabel-active {
			svg {
				fill: ${({ theme }) => theme.palette.base.main};
			}
		}
	}

	${PermissionsCellContainer} {
		justify-content: flex-start;
	}

	${TableHeadingRadioContainer} {
		justify-content: flex-start;
		align-items: baseline;
		margin-top: -22px;
	}

	${TableHeadingRadioTooltip} {
		margin-left: -50px;
	}

	${TableHeadingRadioButton} {
		height: 20px;
	}

	${SearchField} {
		label {
			${({ theme }) => theme.typography.kicker};
		}

		input {
			padding-bottom: 5px;
			padding-left: 0;
			padding-top: 0;
			${({ theme }) => theme.typography.body1};
		}

		.search-field__label {
			position: absolute;
			margin-top: 3px;
			transform: translate(13px, 12px) scale(1);

			&[data-shrink='true'] {
				transform: translate(13px, 18px) scale(1) !important;
			}
		}
	}
`;
