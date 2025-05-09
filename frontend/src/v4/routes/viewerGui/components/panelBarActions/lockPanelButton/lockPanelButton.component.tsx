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
import { PureComponent } from 'react';
import LockIcon from '@mui/icons-material/Lock';
import UnlockIcon from '@mui/icons-material/LockOpen';

import { StyledIconButton } from './lockPanelButton.styles';

export interface ILockPanelButton {
	hidden?: boolean;
	type: string;
	lockedPanels: string[];
	setPanelLock: (panelName) => void;
}

export class LockPanelButton extends PureComponent<ILockPanelButton, any> {
	get isLocked() {
		return this.props.lockedPanels.includes(this.props.type);
	}

	private handleLockPanel = () => this.props.type && this.props.setPanelLock(this.props.type);

	public render() {
		return (
			<StyledIconButton hidden={this.props.hidden} onClick={this.handleLockPanel}>
				{this.isLocked ? <LockIcon /> : <UnlockIcon />}
			</StyledIconButton>
		);
	}
}
