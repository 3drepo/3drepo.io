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
import { Content } from '@/v4/routes/viewerGui/components/risks/components/riskDetails/riskDetails.styles';
import { MeasuringTypeContainer } from '@/v4/routes/viewerGui/components/risks/components/shapesFormTab/shapesFormTab.styles';
import { Wrapper as Measurement } from '@/v4/routes/viewerGui/components/measurements/components/measuringType/measuringType.styles';
import { SectionHeader, List, StyledIconButton as ExpandListButton, Container as MeasurementType } from '@/v4/routes/viewerGui/components/measurements/components/measurementsList/measurementsList.styles';
import { StyledTextField, MeasurementPoint, MeasurementValue } from '@/v4/routes/viewerGui/components/measurements/components/measureItem/measureItem.styles';
import { StyledMarkdownField, StyledLinkableField, ActionsLine } from '@/v4/routes/components/textField/textField.styles';
import { SmallIconButtonStyled } from '@/v4/routes/components/smallIconButon/smallIconButton.styles';

export default css`

	${Content} {
		align-items: center;
		
		${MeasuringTypeContainer} {
			color: ${({ theme }) => theme.palette.base.main};
			font-size: 10px;
		}

		${Measurement} {
			margin: 0 8px;
			height: 24px;
		}

		// expandable list header
		${SectionHeader} {
			background-color: inherit;
			border-bottom: none;

			${ExpandListButton} {
				margin: 0;
			}

			* {
				font-size: 12px;
				color: ${({ theme }) => theme.palette.secondary.main};
				font-weight: 500;

				svg {
					font-size: 24px;
				}
			}
		}

		${MeasurementType}:not(:last-of-type) {
			border-bottom: 1px solid ${({ theme }) => theme.palette.base.lightest};
		}

		// expandable list
		${List} {
			// icons
			${SmallIconButtonStyled} {
				height: 7px;
				width: 7px;
				padding: 4px;
				&, &:hover {
					background-color: ${({ theme }) => theme.palette.secondary.main};
				}

				svg {
					font-size: 13px;
					color: ${({ theme }) => theme.palette.primary.contrast};
				}
			}

			svg {
				font-size: 17px;
			}

			&:last-of-type {
				margin-bottom: -5px;
			}

			// measurement item
			li { 
				background-color: inherit;
				border: none;

				&:last-of-type {
					padding-bottom: 10px;
				}
			}

			${MeasurementPoint},
			${MeasurementValue} {
				font-size: 12px;
				color: ${({ theme }) => theme.palette.secondary.main};
			}

			.MuiFormControl-root {
				width: 113%;
				margin-left: -15px;
			}

			${StyledTextField} {
				overflow: visible;

				${StyledMarkdownField},
				${StyledLinkableField} {
					font-size: 12px;
					color: ${({ theme }) => theme.palette.secondary.main};
				}

				${ActionsLine} {
					bottom: 4px;

					button { 
						margin: 0;
					}
				}
			}
		}
	}
`;
