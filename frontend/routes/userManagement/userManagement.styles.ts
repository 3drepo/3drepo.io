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

import Tab from '@material-ui/core/Tab';

import { media, COLOR } from '../../styles';
import { LoaderContainer as
	DialogLoaderContainer } from '../components/dialogContainer/components/loadingDialog/loadingDialog.styles';

export const Header = styled.div`
	background-color: ${COLOR.WHITE};
	border-bottom: 1px solid ${COLOR.BLACK_6};
`;

export const TabContent = styled.div`
	background-color: ${COLOR.WHITE};
	flex: 1;
	position: relative;
	${media.tablet`height: 500px;`}
`;

export const TeamspaceSelectContainer = styled.div`
	padding: 24px;
`;

export const LoaderContainer = styled(DialogLoaderContainer)`
	height: calc(100% - 65px);
`;

export const StyledTab = styled(Tab)`
	&& {
		padding-left: 24px;
		padding-right: 24px;
	}
`;
