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

import { Revisions, Name as DiffName, CurrentRevision, ModelData as DiffModel } from '@/v4/routes/viewerGui/components/compare/components/compareDiffItem/compareDiffItem.styles';
import { Name as ClashName, Model as ClashModel, ClashTypeSwitch, ClashSettings } from '@/v4/routes/viewerGui/components/compare/components/compareClashItem/compareClashItem.styles';
import { FilterPanel } from '@/v4/routes/viewerGui/components/compare/components/compareFilters/compareFilters.styles';
import { SelectField } from '@/v4/routes/viewerGui/components/compare/components/revisionsSelect/revisionsSelect.styles';
import { css } from 'styled-components';
import { ViewerPanelButton, ViewerPanelFooter } from '@/v4/routes/viewerGui/components/viewerPanel/viewerPanel.styles';
import { SliderWrapper } from '@/v4/routes/viewerGui/components/compare/compare.styles';

export default css`
	${Revisions} {
		height: 26px;
		display: flex;
		align-items: center;

		> :first-child {
			max-width: 294px;
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
			white-space: nowrap;
		}
	}

	${SelectField} {
		margin: 2px;
		height: 24px;
		min-width: 107px;
	}

	${FilterPanel} {
		&&.react-autosuggest__container input {
			padding: 0 14px;
		}
		.MuiInputBase-root {
			padding-left: 39px;
		}
	}

	${DiffModel}, ${ClashModel} {
		max-width: 302px;
	}

	${DiffName}, ${ClashName} {
		max-width: 298px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;

		+ div {
			max-width: 100%;
			height: 26px;
		}
	}

	${ClashSettings} > div {
		max-width: 197px;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}

	${CurrentRevision} {
		white-space: nowrap;
		width: fit-content;
		padding-right: 6px;
	}

	${ClashTypeSwitch} {
		min-width: 85px;
		max-width: 85px;
	}

	${ViewerPanelFooter} ${ViewerPanelButton}[active="1"] {
		background-color: ${({ theme }) => theme.palette.error.main};
		&:hover {
			background-color: ${({ theme }) => theme.palette.error.dark};
		}
	}

	${SliderWrapper} {
		width: 270px;
	}
`;
