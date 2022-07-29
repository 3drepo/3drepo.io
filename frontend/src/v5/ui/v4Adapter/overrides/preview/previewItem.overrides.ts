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
	Container as PreviewListItemContainer,
	Content as PreviewListItemContent,
	Description,
	ArrowButton,
	RoleIndicator,
	ThumbnailWrapper,
	Name,
} from '@/v4/routes/viewerGui/components/previewListItem/previewListItem.styles';
import { Date, Details, Status, Icon, Author, UserAndModelDetails } from '@/v4/routes/viewerGui/components/previewItemInfo/previewItemInfo.styles';

export default css`
	${PreviewListItemContainer} {
		padding: 12px 40px 12px 15px;

		${Name} {
			min-height: 14px;
			text-decoration: underline;
			text-decoration-color: transparent;
		}

		&:hover {
			${Name} {
				text-decoration-color: currentColor;
			}
		}
	}
	
	${PreviewListItemContent} {
		margin: 4px 0 0 12px;
		color: ${({ theme }) => theme.palette.secondary.main};
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

		&:disabled {
			background-color: #edf0f8; // TODO - fix after new palette is released

			svg {
				color: ${({ theme }) => theme.palette.primary.contrast};
			}
		}
	}
	
	${Details} {
		height: fit-content;
		justify-content: space-between;

		${UserAndModelDetails} {
			display: inline-flex;
			justify-content: flex-start;
		}
		
		${Icon} {
			font-size: 11px;
		}

		${Author} {
			font-size: 9px;
			font-weight: 500;
			margin-left: 4px;
			color: ${({ theme }) => theme.palette.secondary.main};
		}
		
		${Status} {
			width: unset;

			svg {
				display: none;
			}
			&::before {
				content: "";
				background-color: ${({ theme }) => theme.palette.tertiary.lightest};
				border-radius: 50%;
				width: 9px;
				height: 9px;
				border: solid 1px ${({ theme }) => theme.palette.tertiary.mid};
			}
		}

		${Date} {
			font-size: 9px;
			font-weight: 500;
			color: ${({ theme }) => theme.palette.base.main};
		}

		${Description} {
			${({ theme }) => theme.typography.caption};
			font-weight: 500px;
			font-size: 10px;
			margin-top: 2px;
			color: ${({ theme }) => theme.palette.base.main};
		}
	}
`;
