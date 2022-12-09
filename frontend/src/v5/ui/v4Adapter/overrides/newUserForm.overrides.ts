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

import { Panel } from '@/v4/routes/components/floatingActionPanel/floatingActionPanel.styles';
import { InvitationModeLink, SaveButton as AddUserButton, Title, UserNotExistsButton, UserNotExistsContainer } from '@/v4/routes/components/newUserForm/newUserForm.styles';
import { css } from 'styled-components';

export default css`
	${Panel} .floating-panel {
		border-radius: 10px;
		padding: 20px;

		/* Assigned Licenses label */
		${Title} {
			color: ${({ theme }) => theme.palette.secondary.main}
		}

		/* Username and Job inputs */
		.MuiFormControl-root {
			margin: 12px 0 0;
			.MuiFormControl-root { /* Remove styles from duplicate formControl in username/email input */
				margin: 0;
			}
			>.MuiInputLabel-root {
				${({ theme }) => theme.typography.body1};
				transform: none;
				color: ${({ theme }) => theme.palette.base.main};
				left: 0;
				top: -20px;
			}
			/* Job selector */
			.MuiSelect-select {
				${({ theme }) => theme.typography.body1};
				color: ${({ theme }) => theme.palette.base.main};
				line-height: 35px;
				display: flex;
			}
		}
		
		/* "Add as Teamspace Admin" checkbox */
		.MuiFormControlLabel-root {
			margin: 0;
			width: fit-content;
			>.MuiCheckbox-root {
				padding: 0;
				margin: 0 10px 0 0;
				color: ${({ theme }) => theme.palette.primary.main};
			};
		}

		${UserNotExistsContainer} {
			${({ theme }) => theme.typography.body1};
			color: ${({ theme }) => theme.palette.error.main};
			padding-top: 10px;
			font-weight: 500;
			${UserNotExistsButton} {
				cursor: pointer;
				color: ${({ theme }) => theme.palette.primary.main};
			}
		}

		${AddUserButton} {
			margin: 12px 0;
			&:not(.Mui-disabled) {
				&, &:hover {
					background-color: ${({ theme }) => theme.palette.primary.main};
					color: ${({ theme }) => theme.palette.primary.contrast};
				}
			}
		}

		/* "Invite to 3D Repo" link */
		${InvitationModeLink} {
			${({ theme }) => theme.typography.body1};
			margin: 10px 0;
			color: ${({ theme }) => theme.palette.primary.main};
			cursor: pointer;
			text-decoration: none;
			&:hover {
				text-decoration: underline;
			}
		}
	}
`;
