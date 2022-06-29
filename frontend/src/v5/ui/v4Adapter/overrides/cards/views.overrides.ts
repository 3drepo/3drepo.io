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
	Container as ViewerContainer,
	SearchField,
	ViewpointsList,
} from '@/v4/routes/viewerGui/components/views/views.styles';
import {
	Image,
	ThumbnailPlaceholder,
	ViewpointItem,
	Name,
} from '@/v4/routes/viewerGui/components/views/components/viewItem/viewItem.styles';

export default css`
	#views-card {
		${ViewerContainer} {
			${SearchField} {
				fieldset {
					border-radius: 0;
				}
			}
		}

		${Image},
		${ThumbnailPlaceholder} {
			width: 70px;
			min-width: 70px;
			height: 70px;
			border-radius: 5px;
			overflow: hidden;
		}

		${ViewpointsList} {
			box-shadow: none !important;

			${ViewpointItem} {
				color: ${({ theme }) => theme.palette.secondary.main};
				font-weight: 500;
				overflow: hidden;

				h3 {
					font-size: 12px;
				}

				&, &:hover {
					background-color: ${({ theme }) => theme.palette.primary.contrast} !important;
				}

				&:hover ${Name} {
					text-decoration: underline;
					text-underline-offset: 2px;
				}
				
				svg {
					color: ${({ theme }) => theme.palette.secondary.main};
					font-size: 19px;
				}

				// edit mode
				form {

					label {
						color: ${({ theme }) => theme.palette.base.main};
						font-size: 10px;

						& + div {
							width: 203px;
						}
					}
					
					input {
						height: 23px;
						font-size: 12px;
					}

					& > div:last-of-type {
						position: relative;
						left: -35px;
						
						svg {
							font-size: 15px;
							color: ${({ theme }) => theme.palette.base.main};
							margin-right: 0;
						}
					}
				}
			}
		}
	}
`;
