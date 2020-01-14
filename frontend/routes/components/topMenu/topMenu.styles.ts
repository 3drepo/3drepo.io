/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import ViewListIcon from '@material-ui/icons/ViewList';
import styled from 'styled-components';
import { COLOR } from '../../../styles';
import * as LogoStyles from '../logo/logo.styles';

export const Container = styled.div`
	display: flex;
	justify-content: flex-end;
	align-items: center;
	position: relative;
	padding-right: 10px;
	height: 80px;
	z-index: 2;
	margin-top: 5px;
	visibility: ${({ hidden }) => hidden ? 'hidden' : 'initial'};

	${LogoStyles.Image} {
		position: absolute;
		top: 15px;
		left: 50%;
		transform: translateX(-50%);
	}
`;

export const BackIcon = styled(ViewListIcon)`
	&& {
		color: ${COLOR.WHITE};
		font-size: 26px;
		filter: drop-shadow(0 0 2px ${COLOR.BLACK_30});
	}
`;
