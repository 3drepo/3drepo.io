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

import { IconButton } from '@material-ui/core';
import LockIcon from '@material-ui/icons/Lock';
import UnlockIcon from '@material-ui/icons/LockOpen';

interface IProps {
	type: string;
	lockedPanels?: string[];
	setPanelLock: (panelName) => void;
}

export class LockPanelButton extends React.PureComponent<IProps, any> {
	get isLocked() {
		return this.props.lockedPanels.includes(this.props.type)
	}

	private handleLockPanel = () => this.props.type && this.props.setPanelLock(this.props.type);

	public render() {
		return (
			<IconButton onClick={this.handleLockPanel}>
				{this.isLocked ? <LockIcon /> : <UnlockIcon />}
			</IconButton>
		);
	}
}
