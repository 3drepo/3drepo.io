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
	TextLabel,
	StyledListItem,
} from '@/v4/routes/components/dialogContainer/components/suggestedTreatmentsDialog/suggestedTreatmentsDialog.styles';
import { LabelButton } from '@/v4/routes/viewerGui/components/labelButton/labelButton.styles';
import { primaryButtonStyling } from '@/v5/ui/v4Adapter/resuableOverrides.styles';
import { EmptyStateInfo } from '@/v4/routes/components/components.styles';

export default css`
	${Container} {
		overflow: hidden;
		/* top bar */
		${StyledGrid} {
			position: initial;

			& > :nth-child(2) {
				margin-right: 10px;
			}
		}

		${Label} {
			font-weight: 600;
			${StyledTypography} {
				font-weight: 400;
				font-size: 13px;
				line-height: 1.125rem;
				color: ${({ theme }) => theme.palette.base.main};
			}
		}

		${StyledDialogContent} {
			min-height: 260px;
			max-height: calc(100vh - 249px);
			margin-top: 0;

			${EmptyStateInfo} {
				margin-right: 0;
				margin-left: 0;
			}

			& * {
				font-family: ${({ theme }) => theme.typography.fontFamily};
				text-transform: none;
				letter-spacing: normal;
			}

			& > ul {
				padding: 0;
				box-shadow: none !important;
				margin-top: -16px;

				li:last-of-type ${StyledListItem} {
					border: none;
				}
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
				${primaryButtonStyling}
				border-radius: 5px;
				padding: 5px 15px;
			}

			// "Stage:" & "Type"
			.MuiGrid-grid-xs-4 {
				max-width: 50%;
				min-width: 50%;
				padding-right: 3px;

				.MuiTypography-noWrap {
					color: ${({ theme }) => theme.palette.base.main};
					${TextLabel} {
						color: ${({ theme }) => theme.palette.secondary.main};
						${({ theme }) => theme.typography.h5}
						font-size: 12px;
					}
	
					${StyledTypography} {
						color: ${({ theme }) => theme.palette.base.main};
						${({ theme }) => theme.typography.body1}
					}
				}
			}
		}
	}
`;
