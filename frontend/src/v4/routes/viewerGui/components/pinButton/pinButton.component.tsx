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
import { PureComponent, Ref, forwardRef, FC } from 'react';
import Tooltip from '@mui/material/Tooltip';

import { VIEWER_EVENTS, VIEWER_MEASURING_MODE } from '../../../../constants/viewer';
import { renderWhenTrueOtherwise } from '../../../../helpers/rendering';
import { ContainedButton } from '../containedButton/containedButton.component';
import { Container, PinIcon } from './pinButton.styles';


interface IProps {
	viewer: any;
	hasPin: boolean;
	disabled?: boolean;
	pinId?: string;
	pinData: any;
	onChange: (pin) => void;
	onSave: () => void;
}

interface IUpdatePinButtonProps {
	pinLabel: string;
	disabled?: boolean;
	onClickButton: () => void;
}

const UpdatePinButton: FC<IUpdatePinButtonProps> = forwardRef(
	({ pinLabel, disabled, onClickButton, ...props }, ref: Ref<HTMLSpanElement>) => (
		<Container ref={ref} {...props}>
			<ContainedButton
				onClick={onClickButton}
				icon={PinIcon}
				disabled={disabled}
			>
				{pinLabel}
			</ContainedButton>
		</Container>
	)
);

export class PinButton extends PureComponent<IProps, any> {
	public state = {
		active: false,
		wasPinDropped: false
	};

	public onClickButton = () => {
		const active = !this.state.active;
		this.handleChangeEditMode(active);
		this.setState({ active });
	}

	public componentWillUnmount = () => {
		if (this.state.active) {
			this.handleChangeEditMode(false);
		}
	}

	public handleChangeEditMode = async (active) => {
		const { viewer, onSave } = this.props;

		if (active) {
			await viewer.setMeasureMode(VIEWER_MEASURING_MODE.POINT, this.handlePickPoint);
			await viewer.enableEdgeSnapping();
			this.togglePinListeners(true);
		} else {
			this.togglePinListeners(false);
			viewer.clearMeasureMode();

			if (onSave) {
				onSave();
			}
		}
	}

	public togglePinListeners = (enabled: boolean) => {
		const resolver = enabled ? 'on' : 'off';
		const { viewer } = this.props;
		viewer[resolver](VIEWER_EVENTS.MEASUREMENT_CREATED, this.handlePickPoint);
		viewer[resolver](VIEWER_EVENTS.MEASUREMENT_MODE_CHANGED, this.onClickButton);
		viewer[resolver](VIEWER_EVENTS.BACKGROUND_SELECTED_PIN_MODE, this.handleClickBackground);
	}

	public handleClickBackground = (event) => {
		this.props.onChange([]);
	}

	public handlePickPoint = ({ position}) => {
		this.setState({wasPinDropped: true});

		if (this.props.onChange) {
			this.props.onChange(position);
		}
	}

	public render() {
		const { disabled } = this.props;
		const wasPinDropped = this.state.wasPinDropped || this.props.hasPin;
		const editMsg = !wasPinDropped ? 'Add pin' : 'Edit pin';
		const pinLabel =  this.state.active ? 'Save pin' :  editMsg;

		return (
			<>
				{renderWhenTrueOtherwise(() => (
					<Tooltip title={`Sorry, You do not have enough permissions to do this.`}>
						<UpdatePinButton
							disabled={disabled}
							onClickButton={this.onClickButton}
							pinLabel={pinLabel}
						/>
					</Tooltip>
				), () => (
					<UpdatePinButton
						disabled={disabled}
						onClickButton={this.onClickButton}
						pinLabel={pinLabel}
					/>
				))(disabled)}
			</>
		);
	}
}
