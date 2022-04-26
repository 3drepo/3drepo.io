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
import { Content, Description } from '@/v4/routes/viewerGui/components/previewListItem/previewListItem.styles';
import { Date, Details, Status } from '@/v4/routes/viewerGui/components/previewItemInfo/previewItemInfo.styles';

export default css`
	${Content} {
		margin: 4px 0 0 12px;
		color: ${({ theme }) => theme.palette.secondary.main};

		${Details} {
			height: fit-content;
		}

		${Status} {
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
			color: ${({ theme }) => theme.palette.base.main};
		}

		${Description} {
			color: ${({ theme }) => theme.palette.base.main};
		}
	}
`;
