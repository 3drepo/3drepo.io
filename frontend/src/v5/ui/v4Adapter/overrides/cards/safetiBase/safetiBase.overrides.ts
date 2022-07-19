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

import { StyledTab, StyledTabs, TabContent } from '@/v4/routes/viewerGui/components/risks/components/riskDetails/riskDetails.styles';
import { css } from 'styled-components';
import safetiBaseRisk from './risk.overrides';
import safetiBaseTreatments from './treatments.overrides';
import safetiBaseSequences from './sequences.overrides';

export default css`
	${StyledTabs} {
		width: auto;
		left: 0;
		${StyledTab} {
			font-size: 13px;
		}
	}
	
	.MuiTabScrollButton-root {
		display: none;
	}
	${TabContent} {
		padding: 0 15px;
		/* TODO - fix after new palette is released */
		background-color: #F7F8FA;
		
		${safetiBaseRisk}
		${safetiBaseTreatments}
		${safetiBaseSequences}
	}
`;
