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
import { FieldsRow } from '@/v4/routes/viewerGui/components/risks/components/riskDetails/riskDetails.styles';
import {
	ResourceItemContainer,
	ResourceItemLeftColumn,
	ResourcesContainer,
	ResourcesList,
	Size,
	IconButton,
} from '@/v4/routes/components/resources/resources.styles';

export default css`
	${ResourcesContainer} {

		${ResourcesList} {
			font-size: 12px;

			${ResourceItemContainer} {
				${ResourceItemLeftColumn} {
					color: ${({ theme }) => theme.palette.primary.main};

					a {
						text-decoration: underline;
						text-underline-offset: 2px;
					}

					svg {
						color: currentColor;
						font-size: 18px;
						margin-top: 5px;
					}
				}

				&:not(:first-of-type) {
					// TODO - fix after new palette is released
					border-top: solid 1px #e0e5f0;
				}
			}

			${Size} {
				color: #6c778c; // TODO - fix after new palette is released
				margin-right: 10px;
				font-size: 12px;

				&::before {
					content: "(";
				}
				&::after {
					content: ")";
				}
			}

			button {
				margin: 1px 0 0 0;
				width: 23px;
			}

			${IconButton} { 
				padding: 5px 0 0 0;
				height: fit-content;

				&:hover {
					background-color: transparent;
				}
				
				svg {
					color: ${({ theme }) => theme.palette.secondary.main};
					font-size: 15px;
				} 
			}
		}
		
		${FieldsRow} {
			justify-content: flex-start;
		}
	}
`;
