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

import styled, { css } from 'styled-components';

import MenuList from '@material-ui/core/MenuList';

import { Name } from '../../viewerGui/components/views/components/viewItem/viewItem.styles';
import { Loader } from '../loader/loader.component';

export const StyledLoader = styled(Loader)`
	margin: 30px 0 20px;
`;

const loadedStyles = css`
	height: 60vh;
	overflow: hidden;
	display: flex;
	flex-direction: column;
`;

export const Container = styled.div`
	width: 380px;
	${({ loaded }: { loaded: boolean }) => loaded ? loadedStyles : ''};

	${Name} {
		max-width: 210px;
	}
`;

export const ViewsWrapper = styled.div`
	overflow-y: auto;
`;

export const ViewList = styled(MenuList)`
	&& {
		padding: 0;
	}
`;
