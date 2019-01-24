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

import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';

export const Container = styled.div`
	position: relative;
` as any;

export const ActionsLine = styled.div`
	position: absolute;
	bottom: 9px;
	right: 0;
`;

export const StyledIconButton = styled(IconButton)`
	&& {
		padding: 5px;
		margin-right: 0;
	}
`;
