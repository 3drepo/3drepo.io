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

import React from 'react';

import Fade from '@material-ui/core/Fade';
import CloseIcon from '@material-ui/icons/Close';

import { Button } from '../../components/panelButton/panelButton.styles';
import { Container } from './closeFocusModeButton.styles';

interface IProps {
	isFocusMode: boolean;
	setIsFocusMode: (isFocusMode) => void;
}

export class CloseFocusModeButton extends React.PureComponent<IProps, any> {
	public render() {
		return (
			<Fade in={this.props.isFocusMode}>
				<Container visible={this.props.isFocusMode}>
					<Button
						label="Close focus mode"
						Icon={CloseIcon}
						action={this.closeFocusMode}
					/>
				</Container>
			</Fade>
		);
	}

	private closeFocusMode = () => {
		this.props.setIsFocusMode(false);
	}
}
