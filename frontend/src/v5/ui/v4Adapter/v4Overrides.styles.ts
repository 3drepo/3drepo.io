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

import styled from 'styled-components';
import { Mark as HighlighterMark } from '@/v4/routes/components/highlight/highlight.styles';
import bottomToolbarStyling from './overrides/bottomToolbar.overrides';
import panelsMenuStyling from './overrides/panelsMenu.overrides';
import leftPanelStyling from './overrides/leftPanel.overrides';
import customTableStyling from './overrides/customTable.overrides';
import previewDetails from './overrides/previewDetails.overrides';
import viewerStyling from './overrides/viewer.overrides';
import previewItemStyling from './overrides/previewItem.overrides';
import commentsStyling from './overrides/comments.overrides';

export const V4OverridesContainer = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;

	${HighlighterMark} {
		background-color: ${({ theme }) => theme.palette.primary.light};
		font-weight: inherit;
	}

	${customTableStyling}

	${viewerStyling}

	${leftPanelStyling}

	${panelsMenuStyling}

	${bottomToolbarStyling}

	${previewItemStyling}

	${previewDetails}

	${commentsStyling}
`;
