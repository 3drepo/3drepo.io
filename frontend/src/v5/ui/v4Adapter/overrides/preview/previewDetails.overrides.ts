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

import { css } from 'styled-components';
import { Details, Container as IssueDetails } from '@/v4/routes/viewerGui/components/previewItemInfo/previewItemInfo.styles';
import { Container, Header, Grid, TitleNumber, StyledForm } from '@/v4/routes/viewerGui/components/previewDetails/previewDetails.styles';
import { FieldWrapper } from '@/v4/routes/components/textField/textField.styles';
import { StyledButton } from '@/v4/routes/viewerGui/components/containedButton/containedButton.styles';


export default css`
	${Container} {
		${StyledButton} {
			border: solid 1px ${({ theme }) => theme.palette.secondary.main};
			color: ${({ theme }) => theme.palette.secondary.main};
			background-color: ${({ theme }) => theme.palette.primary.contrast};
			padding: 0 7px;
			font-size: 10px;
			height: 24px;

			&:hover {
				color: ${({ theme }) => theme.palette.primary.contrast};
				background-color: ${({ theme }) => theme.palette.secondary.main};
			}

			span, svg {
				display: none;
			}
		}

		// title (top part)
		${Header} {
			margin: 0;
			padding-top: 6px;
			min-height: 84px;

			// number and title field
			${Grid} {

				${TitleNumber} {
					color: ${({ theme }) => theme.palette.secondary.main};
					background-color: #edf0f8; // TODO - fix after new palette is released
					border: solid 1px #d9d9d9; // TODO - fix after new palette is released
					border-right: 0;
					border-top-left-radius: 5px;
					border-bottom-left-radius: 5px;
					padding: 2px 7px;
					font-weight: 500;
					margin-right: 0;
					min-width: 8px;
				}

				${StyledForm} {
					${FieldWrapper} {
						height: 24px;
						&::after {
							border-bottom: 1px solid transparent;
						}
					}

					button {						
						margin: 0 10px 0 0 !important;
						height: 15px;
						width: 15px;
					}

					// title textfield input
					span, fieldset, .MuiOutlinedInput-notchedOutline, input {
						border-top-right-radius: 5px;
						border-bottom-right-radius: 5px;
						border-top-left-radius: 0;
						border-bottom-left-radius: 0;
						display: flex;
						align-items: center;
						padding-left: 8px;
						height: 22px;
					}

					.MuiOutlinedInput-notchedOutline {
						top: -1px;
					}

					span {
						color: #c1c8d5; // TODO - fix after new palette is released
						border: solid 1px #c1c8d5; // TODO - fix after new palette is released
						margin: 0;
						box-sizing: border-box;
						height: 100%;
					}

					// weird floating legend
					legend {
						display: none;
					}
				}
			}

			// user + status + clone button
			${Details} {
				${StyledButton} {
					margin-right: 5px;
				}
			}

			${IssueDetails} {
				margin-top: 0;
				justify-content: space-between;
			}
		}
	}
`;
