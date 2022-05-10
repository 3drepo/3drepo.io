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

import { SequenceDateActions, SequenceDateContainer, SequenceDateField } from '@/v4/routes/components/sequencingDates/sequencingDates.styles';
import { StyledFormControl } from '@/v4/routes/viewerGui/components/risks/components/riskDetails/riskDetails.styles';
import { css } from 'styled-components';

// The 4D tab
export default css`
	${StyledFormControl} {
		margin-top: 6px;
		label {
			transform: none;
			top: 0;
			left: 0;
			font-size: 10px;
		}
		${SequenceDateContainer} {
			width: 190px;
			${SequenceDateField} {
				.MuiInputBase-root {
					margin-top: 18px;

					input {
						color: ${({ theme }) => theme.palette.secondary.main};
						box-sizing: border-box;
						width: 184px;
						padding: 0px 8px;
						height: 24px;
						line-height: 24px;
					}
				}
			}
			
			${SequenceDateActions} {
				bottom: -22px;
				left: -9px;
				top: unset;
				right: unset;
				.MuiIconButton-root {
					margin: 3px;
					padding: 0;
					color: ${({ theme }) => theme.palette.secondary.main};
					svg {
						height: 15px;
						width: 15px;
					}
				}
			}
		}
	}
`;
