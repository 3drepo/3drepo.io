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

import { css } from 'styled-components';
import { SequenceTasksListItem } from '@/v4/routes/viewerGui/components/sequences/sequences.styles';
import { Container as LegendItem, StyledTextField as LegendTextField } from '@/v4/routes/viewerGui/components/legend/components/legendItem/legendItem.styles';
import { ActionsLine, StyledIconButton, StyledLinkableField, StyledTextField } from '@/v4/routes/components/textField/textField.styles';
import { Container as ActivityDetailsContainer, Row } from '@/v4/routes/viewerGui/components/activities/components/activityDetails/activityDetails.styles';
import { ActivitiesListStyles } from '../overrides/cards/sequences.overrides';

const LegendDialogStyles = css`
	${LegendItem} {
		.MuiButtonBase-root {
			&:hover {
				background-color: transparent;
			}

			svg {
				color: ${({ theme }) => theme.palette.secondary.main};
				font-size: 19px;
			}
		}

		& > :last-child span {
			margin-left: -37px;
		}

		/* Editable field */
		${StyledLinkableField} {
			${({ theme }) => theme.typography.body1}
			color: ${({ theme }) => theme.palette.secondary.main};
			margin: 12.5px 13px 0;
		}

		${StyledIconButton}:last-of-type {
			margin: 0;
		}

		${StyledTextField} {
			padding: 1px;
		}

		${LegendTextField} ${ActionsLine} {
			top: 8px;

			button {
				margin: 0;
			}
		}

		// edit mode
		form {
			span, input {
				height: 23px;
				font-size: 12px;
			}
			
			input {
				margin-top: 1px;
			}

			& > div:last-of-type {
				position: relative;
				left: -35px;

				&:hover span {
					text-decoration: underline;
					text-underline-offset: 2px;
				}
				
				svg {
					font-size: 15px;
					color: ${({ theme }) => theme.palette.secondary.main};
					margin-right: 0;
				}
			}

			.MuiFormHelperText-root {
				display: none;
			}
		}
	}
`;

const ActivityDetailsStyles = css`
	${ActivityDetailsContainer} {
		padding: 10px 15px 7px;

		${Row} {
			${({ theme }) => theme.typography.body1}
			color: ${({ theme }) => theme.palette.base.main};

			& > div:first-child {
				padding: 0 0 7px;
				color: ${({ theme }) => theme.palette.secondary.main};
				font-weight: 500;
			}

			button {
				margin: 0;

				&:hover {
					background-color: transparent;
				}

				svg {
					color: ${({ theme }) => theme.palette.secondary.main};
					margin-top: -3px;
					width: 15px;
					height: 15px;
				}
			}
		}
	}
`;

export default css`
	${ActivitiesListStyles}
	${ActivityDetailsStyles}
	${SequenceTasksListItem} {
		margin: 0;
	}
	${LegendDialogStyles}
`;
