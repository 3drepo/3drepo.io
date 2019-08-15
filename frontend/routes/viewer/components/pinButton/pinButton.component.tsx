/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import * as React from 'react';
import { Viewer } from '../../../../services/viewer/viewer';
import { VIEWER_EVENTS, NEW_PIN_ID } from '../../../../constants/viewer';
import { PinIcon, Container } from './pinButton.styles';
import { LabelButton } from '../labelButton/labelButton.styles';

interface IProps {
	onChange: (pin) => void;
	onSave: () => void;
	hasPin: boolean;
	disabled?: boolean;
	disableMeasure: (isDisabled) => void;
	deactivateMeasure: () => void;
}

export class PinButton extends React.PureComponent<IProps, any> {
	public state = {
		active: false,
		wasPinDropped: false
	};

	public onClickButton = (e) => {
		const active = !this.state.active;
		this.handleChangePin(active);
		this.setState({ active });
	}

	public componentWillUnmount = () => {
		this.togglePinListeners(false);
	}

	public handleChangePin = (active) => {
		if (active) {
			Viewer.setPinDropMode(true);
			this.props.deactivateMeasure();
			this.props.disableMeasure(true);
			this.togglePinListeners(true);
		} else {
			Viewer.setPinDropMode(false);
			this.props.disableMeasure(false);
			this.togglePinListeners(false);
			const pinData = Viewer.getPinData();

			if (this.props.onSave) {
				this.props.onSave();
			}

		}
	}

	public togglePinListeners = (enabled: boolean) => {
		const resolver = enabled ? 'on' : 'off';
		Viewer[resolver](VIEWER_EVENTS.PICK_POINT, this.handlePickPoint);
		Viewer[resolver](VIEWER_EVENTS.BACKGROUND_SELECTED_PIN_MODE, this.handleClickBackground);
	}

	public handleClickBackground = (event) => {
		this.props.onChange([]);
	}

	public handlePickPoint = ({ trans, position, normal, selectColour, id }) => {
		if (id) {
			return null;
		}

		this.setState({wasPinDropped: true});

		if (trans) {
			position = trans.inverse().multMatrixPnt(position);
		}

		if (this.props.onChange) {
			this.props.onChange(position);
		}
	}

	public render() {
		const { disabled } = this.props;
		const wasPinDropped = this.state.wasPinDropped || this.props.hasPin;
		const editMsg = !wasPinDropped ? 'Add pin' : 'Edit pin';
		const pinLabel =  this.state.active ? 'Save pin' :  editMsg;
		const pinIConColor = disabled ? 'disabled' :
							this.state.active && !disabled ? 'secondary' : 'primary';

		return (
				<Container>
					<PinIcon color={pinIConColor}/>
					<LabelButton disabled={disabled} onClick={this.onClickButton}>{pinLabel}</LabelButton>
				</Container>
				);
	}
}
