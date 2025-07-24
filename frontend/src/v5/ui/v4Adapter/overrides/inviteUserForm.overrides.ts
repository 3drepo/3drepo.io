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

import { Item as SelectListItem } from '@/v4/routes/components/customTable/components/cellSelect/cellSelect.styles';
import { SortLabel } from '@/v4/routes/components/customTable/components/tableHeading/tableHeading.styles';
import { RadioContainer } from '@/v4/routes/components/customTable/components/tableHeadingRadio/tableHeadingRadio.styles';
import { Row, Cell, BodyWrapper as CustomTableBody } from '@/v4/routes/components/customTable/customTable.styles';
import {
	AddButton,
	Container as Modal,
	Content,
	Footer,
	IconButton,
	PermissionsTable,
	ProjectCheckboxContainer,
	ProjectConfig,
} from '@/v4/routes/components/invitationDialog/invitationDialog.styles';
import { Color as JobColorDot, Name as JobTitle } from '@/v4/routes/components/jobItem/jobItem.styles';
import { Container as TableCell, Detail, Name } from '@/v4/routes/components/modelItem/modelItem.styles';
import { EmptySelectValue } from '@/v4/routes/components/newUserForm/newUserForm.styles';
import { css } from 'styled-components';
import { secondaryTextButtonStyling } from '../resuableOverrides.styles';

const JobSelectStyles = css`
	${JobColorDot} {
		width: 10px;
		height: 10px;
	}
	${JobTitle}, ${EmptySelectValue} {
		${({ theme }) => theme.typography.body1}
		color: ${({ theme }) => theme.palette.secondary.main};
		width: calc(100% - 22px);
		&:first-of-type {
			width: 100%;
		}
	}
	${SelectListItem} {
		${({ theme }) => theme.typography.body1}
		color: ${({ theme }) => theme.palette.secondary.main};
	}
`;

const EmailAndJobInputStyles = css`
	.MuiFormControl-root {
		margin-bottom: 13px;
		max-width: 470px;
		position: relative;
		.MuiInputLabel-root {
			${({ theme }) => theme.typography.body1};
		}
		.MuiInputBase-input {
			height: 36px;
			line-height: 36px;
			.MuiGrid-item {
				${({ theme }) => theme.typography.body1};
				line-height: 36px;
			}
		}
		svg {
			margin-top: 0;
			right: 15px;
		}
	}
`;

const TeamspaceAdminCheckboxStyles = css`
	.MuiFormControlLabel-root {
		height: auto;
		margin: 0 0 10px 0;
		.MuiCheckbox-root {
			color: ${({ theme }) => theme.palette.primary.main};
			margin: 0 8px 0 0;
			padding: 0;
		}
	}
`;

const ProjectSelectorStyles = css`
	${ProjectConfig} {
		padding: 20px 0 10px;
		margin-top: 20px;
		border-top: 1px solid ${({ theme }) => theme.palette.base.lightest};

		.MuiFormControl-root {
			margin-bottom: 0;
		}
		${IconButton} {
			border: 1px solid ${({ theme }) => theme.palette.secondary.main};
			border-radius: 8px;
			padding: 8px 16px;
			color: ${({ theme }) => theme.palette.secondary.main};
			${({ theme }) => theme.typography.body1};
			font-weight: 600;
			margin: 0 14px;
			&::before {
				content: 'Remove';
			}
			svg {
				display: none;
			}
			&:hover {
				background: ${({ theme }) => theme.palette.secondary.main};
				color: ${({ theme }) => theme.palette.primary.contrast};
			}
		}
		${ProjectCheckboxContainer} {
			width: 190px;
		}
	}
`;

const PermissionsTableStyles = css`
	${PermissionsTable} {
		border: none;
		height: auto;
		margin: 0;
		${RadioContainer} {
			align-items: center;
			position: relative;
			${SortLabel} svg {
				position: absolute;
				right: -15px;
			}
		}

		${CustomTableBody} ${Row} {
			${Cell}:first-child {
				border-right: 1px solid ${({ theme }) => theme.palette.base.lightest};
				justify-content: left;
			}
			${Cell} >* {
				justify-content: center;
			}
		}
		
		.MuiFormControl-root {
			margin-bottom: 0;
			.MuiFormLabel-root {
				${({ theme }) => theme.typography.kicker};
				font-weight: 500;
			}
			.MuiInputBase-input {
				height: 20px;
				line-height: 20px;
				padding: 0 !important;
			}
		}
		${TableCell} {
			${Name} {
				color: ${({ theme }) => theme.palette.secondary.main};
			}
			${Detail} {
				color: ${({ theme }) => theme.palette.secondary.light};
			}
		}
	}
`;

const AddPermissionsButton = css`
	${AddButton} {
		border-radius: 8px;
		background-color: ${({ theme }) => theme.palette.primary.main};
		padding: 8px 16px;
		margin: 4px 0;
		color: ${({ theme }) => theme.palette.primary.contrast};
		user-select: none;
		width: fit-content;
		:hover {
			text-decoration: none;
		}
		svg {
			color: ${({ theme }) => theme.palette.primary.contrast};
			height: 15px;
			width: 15px;
			margin: 0 8px 0 0;
		}
	}
`;

export default css`
	${JobSelectStyles}
	${Modal} {
		min-width: 520px;
		${Content} {
			background-color: ${({ theme }) => theme.palette.tertiary.lightest};
			padding: 30px;
			.MuiInputBase-root {
				width: 100%;
			}
			${EmailAndJobInputStyles}
			${TeamspaceAdminCheckboxStyles}
			${ProjectSelectorStyles}
			${PermissionsTableStyles}
			${AddPermissionsButton}
		}
		${Footer} {
			.MuiButtonBase-root.MuiButtonBase-root:first-child {
				${secondaryTextButtonStyling}
			}
		}
	}
`;
