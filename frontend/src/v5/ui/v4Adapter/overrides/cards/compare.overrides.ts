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

import { Tabs } from '@/v4/routes/viewerGui/components/compare/compare.styles';
import { Revisions } from '@/v4/routes/viewerGui/components/compare/components/compareDiffItem/compareDiffItem.styles';
import { FilterPanel } from '@/v4/routes/viewerGui/components/compare/components/compareFilters/compareFilters.styles';
import { SelectField } from '@/v4/routes/viewerGui/components/compare/components/revisionsSelect/revisionsSelect.styles';
import { css } from 'styled-components';

export default css`
	${Tabs} .MuiTab-root {
		white-space: nowrap;
		overflow: visible;
	}
	${Revisions} {
		height: 26px;
		display: flex;
		align-items: center;
	}

	${SelectField} {
		margin: 2px;
		height: 24px;
	}

	${FilterPanel} .MuiInputBase-root {
		padding-left: 39px;
	}
`;
