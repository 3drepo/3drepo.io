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
import { Header } from '@/v4/routes/viewerGui/components/risks/components/levelOfRisk/levelOfRisk.styles';
import { DateFieldContainer } from '@/v4/routes/viewerGui/components/risks/components/mainRiskFormTab/mainRiskFormTab.styles';
import { DescriptionImage, FieldsContainer, FieldsRow, StyledFormControl } from '@/v4/routes/viewerGui/components/risks/components/riskDetails/riskDetails.styles';
import { UpdateButtonsContainer } from '@/v4/routes/viewerGui/components/updateButtons/updateButtons.styles';
import { DescriptionStyles } from '../issues/properties.overrides';

export default css`
	${DescriptionStyles}
	${DescriptionImage} img {
		border-radius: 5px;
	}
	${UpdateButtonsContainer} {
		margin-bottom: 5px;
	}
	${FieldsRow} {
		.MuiFormControl-root {
			padding-top: 25px;
			.MuiFormControl-root {
				padding: 0;
			}
		}
		.MuiInputBase-input, .MuiSelect-select, .MuiOutlinedInput-notchedOutline {
			box-sizing: border-box;
			margin: 0;
			color: ${({ theme }) => theme.palette.secondary.main};
			~ svg {
				margin-top: -4px;
				/* TODO: fix after new palette is released */
				color: #C1C8D5;
			}
		}
		input, fieldset {
			margin: 0;
		}
		${StyledFormControl} {
			margin: 0;
			&:first-child {
				margin-right: 5px;
			}
			&:last-child {
				margin-left: 5px;
			}
			${DateFieldContainer} {
				margin: 0;
				input, fieldset {
					margin-top: 0;
				}
			}
			label {
				top: 6px;
			}
			.MuiFormControl-root {
				label {
					top: -19px;
				}
			}
		}
		${FieldsContainer} {
			width: calc(50% - 5px);
			${StyledFormControl} {
				margin: 0;
				/* Level of risk */
				${Header} {
					margin-top: -13px;
					font-size: 10px;
					color: ${({ theme }) => theme.palette.base.main};
				}
				label {
					top: 5px;
				}
			}
			label {
				font-size: 10px;
				top: -10px;
			}
		}
	}
`;
