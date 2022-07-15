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
import { css } from 'styled-components';
import {
	Container,
	Label,
	StyledGrid,
	StyledTypography,
	StyledDialogContent,
	Description,
	ExpandButton,
} from '@/v4/routes/components/dialogContainer/components/suggestedTreatmentsDialog/suggestedTreatmentsDialog.styles';
import { LabelButton } from '@/v4/routes/viewerGui/components/labelButton/labelButton.styles';
import { labelButtonSecondaryStyles } from '@controls/button/button.styles';

export default css`
	${Container} {
		${StyledGrid} {
			display: flex;
			justify-content: center;
		}

		${Label} ${StyledTypography} {
			font-weight: 400;
			font-size: 13px;
			line-height: 1.125rem;
			color: ${({ theme }) => theme.palette.base.main};
		}

		.MuiInputBase-root {
			svg {
				color: ${({ theme }) => theme.palette.base.lightest};
				margin-top: -15px;
			}
		}

		.MuiSelect-select {
			margin-top: 0;
		}

		${StyledDialogContent} {
			margin-top: 52px;
			
			& * {
				font-family: ${({ theme }) => theme.typography.fontFamily};
				text-transform: none;
				letter-spacing: normal;
			}

			& > ul {
				padding: 0 24px;
			}

			.MuiListItemText-root * {
				font-size: 0.75rem;
			}

			// title
			.MuiListItemText-primary {
				font-size: 0.875rem;
				font-weight: 500;
				margin-bottom: 4px;
			}

			${Description} {
				color: ${({ theme }) => theme.palette.base.main};
			}

			${ExpandButton} {
				margin-top: 12px;
				font-weight: 500;
				color: ${({ theme }) => theme.palette.secondary.main};
			}

			${LabelButton} {
				${labelButtonSecondaryStyles}
				border-radius: 5px;
				padding: 8px 15px;
			}

			${StyledTypography} {
				color: ${({ theme }) => theme.palette.base.dark};
			}

			// "Stage:" & "Type"
			.MuiTypography-noWrap {
				font-weight: 600;

				& > span {
					font-weight: 400;
				}
			}
		}
	}
`;
