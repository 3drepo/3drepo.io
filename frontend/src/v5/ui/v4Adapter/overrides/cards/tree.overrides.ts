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
	StyledExpandableButton,
	Name,
	Actions,
} from '@/v4/routes/viewerGui/components/tree/components/treeNode/treeNode.styles';
import { EmptyStateInfo } from '@/v4/routes/components/components.styles';

export default css`
	#tree-card {
		font-weight: 500;
		color: ${({ theme }) => theme.palette.secondary.main};
		background-color: ${({ theme }) => theme.palette.primary.contrast};

		${StyledExpandableButton} {
			&:hover {
				cursor: pointer;
			}
			margin-right: 12px;
			align-items: center;
		}

		${Name} {
			margin-left: 0;
		}

		${Actions} {
			& > span { 
				padding: 4px;
				margin: 4px;
				
				&:hover {
					background-color: transparent;
				}

				svg { 
					font-size: 19px;
					color: inherit;
				}
			}
		}

		${EmptyStateInfo} {
			margin: 12px 14px;
			width: unset; 
		}
	}
`;
