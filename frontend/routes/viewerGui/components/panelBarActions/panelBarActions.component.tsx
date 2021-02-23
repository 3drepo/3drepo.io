/**
 *  Copyright (C) 2020 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.ś
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as React from 'react';

import { LockPanelButton } from './lockPanelButton';
import { MenuButton } from './menuButton';
import { SearchButton } from './searchButton';

interface IProps {
	hideLock?: boolean;
	type?: string;
	hideMenu?: boolean;
	menuLabel?: string;
	menuActions?: (props?) => React.ReactNode;
	menuDisabled?: boolean;
	menuOpen?: boolean;
	hideSearch?: boolean;
	isSearchEnabled?: boolean;
	onSearchOpen?: () => void;
	onSearchClose?: () => void;
	onMenuClose?: () => void;
	onMenuOpen?: () => void;
}

export const PanelBarActions: React.FunctionComponent<IProps> = ({
	hideLock = false, hideSearch = false, hideMenu = false, type, menuLabel, menuActions,
	isSearchEnabled, onSearchOpen, onSearchClose, menuDisabled = false, menuOpen, onMenuClose, onMenuOpen
}) => {

	return (
		<>
			<LockPanelButton hidden={hideLock} type={type} />
			<SearchButton hidden={hideSearch} enabled={isSearchEnabled} onOpen={onSearchOpen} onClose={onSearchClose} />
			<MenuButton
				hidden={hideMenu}
				label={menuLabel}
				content={menuActions}
				disabled={menuDisabled}
				open={menuOpen}
				onOpen={onMenuOpen}
				onClose={onMenuClose}
			/>
		</>
	);
};
