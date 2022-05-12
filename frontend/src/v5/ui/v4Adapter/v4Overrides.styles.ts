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

import styled from 'styled-components';
import { Mark as HighlighterMark } from '@/v4/routes/components/highlight/highlight.styles';
import { Container as RevisionsSwitchContainer } from '@/v4/routes/viewerGui/components/revisionsSwitch/revisionsSwitch.styles';
import bottomToolbar from './overrides/bottomToolbar.overrides';
import panelsMenu from './overrides/panelsMenu.overrides';
import leftPanel from './overrides/leftPanel.overrides';
import customTable from './overrides/customTable.overrides';
import previewDetails from './overrides/preview/previewDetails.overrides';
import previewItem from './overrides/preview/previewItem.overrides';
import previewComments from './overrides/preview/previewComments.overrides';
import avatarPopover from './overrides/avatarPopover.overrides';

import issueShapes from './overrides/cards/issues/shapes.overrides';
import groups from './overrides/cards/groups.overrides';

export const V4OverridesContainer = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;

	${customTable}

	${avatarPopover}

	${HighlighterMark} {
		background-color: ${({ theme }) => theme.palette.primary.light};
		font-weight: inherit;
	}

	${panelsMenu}
	
	${customTable}
	
	${leftPanel}
	${panelsMenu}
	${bottomToolbar}
	
	${previewItem}
	${previewDetails}
	${previewComments}
	
	${issueShapes}

	${groups}
	${RevisionsSwitchContainer} {
		display: none;
	}
`;
