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
import { SectionHeader, List, StyledIconButton as ExpandListButton } from '@/v4/routes/viewerGui/components/measurements/components/measurementsList/measurementsList.styles';
import { StyledTextField, MeasurementPoint, MeasurementValue } from '@/v4/routes/viewerGui/components/measurements/components/measureItem/measureItem.styles';
import { ColorSelect, StyledIconButton } from '@/v4/routes/components/colorPicker/colorPicker.styles';
import { StyledMarkdownField, StyledLinkableField, ActionsLine } from '@/v4/routes/components/textField/textField.styles';

export default css`
	// color picker
	${ColorSelect} {
		width: unset;
		margin-left: 8px;

		${StyledIconButton} {
			margin: 0;
		}
	}

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

			&:not(:first-of-type) {
				margin-top: 15px;
			}

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

		// expandable list
		${List} {
			border-bottom: none;

			&:last-of-type {
				margin-bottom: -5px;
			}

			li { 
				background-color: inherit;
				border-top: 1px solid ${({ theme }) => theme.palette.base.lightest};
				border-bottom: none;
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
