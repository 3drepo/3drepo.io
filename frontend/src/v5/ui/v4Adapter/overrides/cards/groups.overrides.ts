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

import { GroupActions, GroupListItem } from '@/v4/routes/viewerGui/components/groups/groups.styles';
import { Container as GroupDetails } from '@/v4/routes/viewerGui/components/groups/components/groupDetails/groupDetails.styles';
import { 
	Container as PreviewListItemContainer,
	Content as PreviewListItemContent,
	RoleIndicator,
	Description,
	Actions
} from '@/v4/routes/viewerGui/components/previewListItem/previewListItem.styles';
import { Status, ExtraInfo } from '@/v4/routes/viewerGui/components/previewItemInfo/previewItemInfo.styles';
import { css } from 'styled-components';
import { Actions as BottomLeftButtons } from '@/v4/routes/viewerGui/components/groups/components/groupDetails/groupDetails.styles';
import { ColorSelect } from '@/v4/routes/components/colorPicker/colorPicker.styles';

const previewGrouItem = css`
	${PreviewListItemContainer} {
		padding: 7px;
	}

	${PreviewListItemContent} {
		margin: 5px 0 0;
	}

	${RoleIndicator} {
		display: inline-block;
		border: none;
		width: 8px;
		margin-right: 10px;
	}
	
		
	${Status} {
		svg {
			display: inline-block;
			font-size: 15px;
		}

		&::before {
			display: none;
		}
	}

	${Description} {
		font-size: 10px;

		&, ${ExtraInfo} {
			color: ${({ theme }) => theme.palette.base.main};
			font-weight: 500;
		}
	}

	${ExtraInfo} {
		font-size: 9px;
	}

	${GroupListItem} {
		${Actions} {
			right: 10px;
		}

		${GroupActions} {
			button {
				margin: 0;
				padding: 8px;
				
				svg path {
					fill: currentColor;
				}

				&, &:hover {
					background-color: transparent;
				}
			}
		}
	}
`;

const expandedGroupItem = css`
	${GroupDetails} {
	}

	// footer 
	${BottomLeftButtons} {
		${ColorSelect} {
			background-color: transparent;
			border-bottom: none;
		}

		button {
			&, &:hover {
				background-color: transparent;
			}
		}
	}
`;

export default css`
	#groups-card {
		${previewGrouItem}
	}

	#groups-card-details {
		${expandedGroupItem}
	}
`;
