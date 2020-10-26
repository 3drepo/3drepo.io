/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import Popover from '@material-ui/core/Popover';
import CameraIcon from '@material-ui/icons/LinkedCamera';
import { cond, matches, stubTrue } from 'lodash';

import { PresentationMode } from '../../../modules/presentation/presentation.constants';
import { COLOR } from '../../../styles';

const getVariantColor = cond([
	[matches(PresentationMode.PRESENTER), () => COLOR.DUSTY_RED],
	[matches(PresentationMode.PARTICIPANT), () => COLOR.SOFT_BLUE],
	[stubTrue, () => COLOR.WHITE],
]);

export interface IPresentationModeIcon {
	mode: PresentationMode;
}

export const PresentationIcon = styled(CameraIcon)`
	&& {
		color: ${({ mode }: IPresentationModeIcon) => getVariantColor(mode)};
		font-size: 24px;
		filter: drop-shadow(0 0 2px ${COLOR.BLACK_30});
	}
`;

export const StyledPopover = styled(Popover)`
	&& {
		box-shadow: 0 0 2px ${COLOR.BLACK_20};
	}
`;
