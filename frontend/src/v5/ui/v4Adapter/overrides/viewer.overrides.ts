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
import { ArrowButton, RoleIndicator, ThumbnailWrapper, Container, Name, Description } from '@/v4/routes/viewerGui/components/previewListItem/previewListItem.styles';
import { Details, Icon, Status, Author, Date } from '@/v4/routes/viewerGui/components/previewItemInfo/previewItemInfo.styles';

export default css`

	${Container} {
		padding: 12px 0 12px 15px;
	}

	${RoleIndicator} {
		display: none;
	}

	${ThumbnailWrapper} {
		width: 70px;
		height: 70px;
		border-radius: 5px;
		overflow: hidden;
	}

	${Name} {
		font-weight: 500;
		color: ${({ theme }) => theme.palette.secondary.main};
	}

	${Details} {
		justify-content: flex-start;
		
		${Icon} {
			font-size: 11px;
		}
		
		${Status} {
			width: unset;
		}

		${Author} {
			font-size: 9px;
			font-weight: 500;
			margin-left: 4px;
			color: ${({ theme }) => theme.palette.secondary.main};
		}

		${Date} {
			font-size: 9px;
			font-weight: 500;
		}
	}

	${Description} {
		${({ theme }) => theme.typography.caption};
		font-weight: 500px;
		font-size: 10px;
		margin-top: 2px;
	}


	${ArrowButton} {
		background-color: ${({ theme }) => theme.palette.primary.lightest};
		padding: 0;
		margin: 0;

		svg {
			color: ${({ theme }) => theme.palette.primary.main};
		}

		&:hover {
			background-color: ${({ theme }) => theme.palette.primary.main};

			svg {
				color: ${({ theme }) => theme.palette.primary.contrast};
			}
		}
	}
`;
