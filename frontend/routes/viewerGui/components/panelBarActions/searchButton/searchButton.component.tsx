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

import React from 'react';

import CancelIcon from '@material-ui/icons/Cancel';
import SearchIcon from '@material-ui/icons/Search';

import { StyledIconButton } from '../lockPanelButton/lockPanelButton.styles';

export interface IMenuButton {
	hidden?: boolean;
	enabled?: boolean;
	onOpen?: () => void;
	onClose?: () => void;
}

export const SearchButton: React.FunctionComponent<IMenuButton> = ({ hidden, enabled, onOpen, onClose }) => {
	return (
		<StyledIconButton
			hidden={hidden}
			onClick={enabled ? onClose : onOpen}
		>
			{enabled ? <CancelIcon /> : <SearchIcon />}
		</StyledIconButton>
	);
};
