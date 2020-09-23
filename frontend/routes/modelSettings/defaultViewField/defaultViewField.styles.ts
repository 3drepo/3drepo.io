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

import Typography from '@material-ui/core/Typography';

import { COLOR, FONT_WEIGHT } from '../../../styles';
import { StyledDeleteIcon, StyledEditIcon } from '../../viewerGui/components/views/components/viewItem/viewItem.styles';

export const ViewRow = styled.div`
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;

	${StyledEditIcon}, ${StyledDeleteIcon} {
		color: ${COLOR.BLACK_54}
	}
`;

export const ViewName = styled(Typography)`
	&& {
		font-weight: ${FONT_WEIGHT.NORMAL};
		margin-right: 16px;
		color: ${COLOR.BLACK_60}
	}
`;
