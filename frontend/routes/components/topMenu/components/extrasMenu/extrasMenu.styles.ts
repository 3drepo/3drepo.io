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

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Switch from '@material-ui/core/Switch';
import Menu from '@material-ui/icons/Menu';
import styled from 'styled-components';

import { COLOR } from '../../../../../styles';
import * as AvatarStyles from '../../../avatar/avatar.styles';

export const BurgerIcon = styled(Menu)`
	&& {
		color: ${COLOR.WHITE};
		font-size: 28px;
		filter: drop-shadow(0 0 2px ${COLOR.BLACK_30});
	}
`;

export const MenuContent = styled(List)`
	&& {
		padding-top: 0;
	}

	${AvatarStyles.Container} {
		margin-left: -3px;
	}
`;

export const MenuIcon = styled(ListItemIcon)`
	&& {
		margin-right: 2px;
	}
`;

export const MenuItem = styled(ListItem)`
	&& {
		height: 48px;
	}
`;

export const MenuUser = styled(ListItem)`
	&& {
		height: 58px;
	}
`;

export const MenuText = styled(ListItemText).attrs({
	disableTypography: true
})`
	&& {
		color: ${COLOR.BLACK_60};
		font-size: 14px;
	}
`;

export const MenuSwitch = styled(Switch)`
	&& {
		margin-left: -21px;
		margin-right: -15px;
	}
`;
