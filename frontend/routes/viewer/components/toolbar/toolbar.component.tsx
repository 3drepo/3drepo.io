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

import * as React from 'react';
import Fade from '@material-ui/core/Fade';
import HomeIcon from '@material-ui/icons/Home';
import ClipIcon from '@material-ui/icons/Crop';
import FocusIcon from '@material-ui/icons/CenterFocusStrong';
import ShowAllIcon from '@material-ui/icons/Visibility';
import HideIcon from '@material-ui/icons/VisibilityOff';
import IsolateIcon from '@material-ui/icons/VisibilityOutlined';
import MetadataIcon from '@material-ui/icons/Info';
import TurntableIcon from '@material-ui/icons/Redo';

import IncreaseIcon from '@material-ui/icons/Add';
import DecreaseIcon from '@material-ui/icons/Remove';
import ResetIcon from '@material-ui/icons/Replay';

import { Helicopter, Ruler } from '../../../components/fontAwesomeIcon';

import { Container, ButtonWrapper, Submenu } from './toolbar.styles';
import { TooltipButton } from '../../../teamspaces/components/tooltipButton/tooltipButton.component';

import { VIEWER_NAV_MODES } from '../../../../constants/viewer';
import { renderWhenTrue } from '../../../../helpers/rendering';
import {
	INITIAL_HELICOPTER_SPEED, MIN_HELICOPTER_SPEED, MAX_HELICOPTER_SPEED
} from '../../../../components/viewer/js/viewer.service';

const MeasureIcon = () => <Ruler IconProps={{ className: 'fontSizeSmall' }} />;
const HelicopterIcon = () => <Helicopter IconProps={{ className: 'fontSizeSmall' }} />;

interface IProps {
	navigationMode: string;
	helicopterSpeed: number;
	goToExtent: () => void;
	setNavigationMode: (mode) => void;
	initialiseToolbar: () => void;
	increaseHelicopterSpeed: () => void;
	decreaseHelicopterSpeed: () => void;
	resetHelicopterSpeed: () => void;
}

interface IState {
	activeButton: string;
	activeSubMenu: string;
}

export class Toolbar extends React.PureComponent<IProps, IState> {
	public state = {
		activeButton: '',
		activeSubMenu: ''
	};

	public componentDidMount() {
		this.props.initialiseToolbar();
	}

	public onClick = () => {};

	public onNavigationModeClick = (mode) => {
		this.props.setNavigationMode(mode);
		this.setState({
			activeSubMenu: ''
		});
	}

	public handleShowSubmenu = (label) => {
		this.setState((prevState) => ({
			activeSubMenu: prevState.activeSubMenu !== label ? label : ''
		}));
	}

	public get toolbarList() {
		return [
			{ label: 'Extent', Icon: HomeIcon, action: this.props.goToExtent, show: true },
			{
				label: 'Turntable',
				Icon: TurntableIcon,
				action: () => this.handleShowSubmenu('Turntable'),
				show: this.props.navigationMode === VIEWER_NAV_MODES.TURNTABLE,
				subMenu: [
					{
						label: 'Helicopter',
						Icon: HelicopterIcon,
						action: () => this.onNavigationModeClick(VIEWER_NAV_MODES.HELICOPTER),
						show: true
					}
				]
			},
			{
				label: 'Helicopter',
				Icon: HelicopterIcon,
				action: () => this.handleShowSubmenu('Helicopter'),
				show: this.props.navigationMode === VIEWER_NAV_MODES.HELICOPTER,
				subMenu: [
					{
						label: `Reset speed to ${INITIAL_HELICOPTER_SPEED}`,
						Icon: ResetIcon,
						action: this.props.resetHelicopterSpeed,
						specificOption: true
					},
					{
						label: `Increase speed to ${this.props.helicopterSpeed + 1}`,
						Icon: IncreaseIcon,
						action: this.props.increaseHelicopterSpeed,
						specificOption: true,
						disabled: this.props.helicopterSpeed === MAX_HELICOPTER_SPEED
					},
					{
						label: `Decrease speed to ${this.props.helicopterSpeed - 1}`,
						Icon: DecreaseIcon,
						action: this.props.decreaseHelicopterSpeed,
						specificOption: true,
						disabled: this.props.helicopterSpeed === MIN_HELICOPTER_SPEED
					},
					{
						label: 'Turntable',
						Icon: TurntableIcon,
						action: () => this.onNavigationModeClick(VIEWER_NAV_MODES.TURNTABLE)
					}
				]
			},
			{ label: 'Show All', Icon: ShowAllIcon, action: this.onClick, show: true },
			{ label: 'Hide', Icon: HideIcon, action: this.onClick, show: true  },
			{ label: 'Isolate', Icon: IsolateIcon, action: this.onClick, show: true },
			{ label: 'Focus', Icon: FocusIcon, action: this.onClick, show: true },
			{ label: 'Clip', Icon: ClipIcon, action: this.onClick, show: true },
			{ label: 'Measure', Icon: MeasureIcon, action: this.onClick, show: true },
			{ label: 'BIM', Icon: MetadataIcon, action: this.onClick, show: true }
		];
	}

	public renderButtons = () => {
		return this.toolbarList.map((
			{label, Icon, action, show = true, subMenu = []}, index
			) => renderWhenTrue(() => (
			<ButtonWrapper key={index}>
				<TooltipButton
					className="toolbarButton"
					label={label}
					Icon={Icon}
					action={action}
				/>
				{this.renderSubmenu(subMenu, label)}
			</ButtonWrapper>)
		)(show));
	}

	public renderSubmenu = (subMenu, label) => renderWhenTrue(() => {
		const condition = this.state.activeSubMenu === label;
		return (
			<Fade in={condition}>
				<Submenu>{subMenu.map((subButton, subKey) => (
					<TooltipButton
						key={subKey}
						className={`toolbarButton toolbarSubButton ${subButton.specificOption && 'toolbarSpecificButton'}`}
						label={subButton.label}
						Icon={subButton.Icon}
						action={subButton.action}
						disabled={subButton.disabled} />)
					)}
				</Submenu>
			</Fade>
		);
	})(subMenu.length && this.state.activeSubMenu === label)

	public render() {
		return (
			<Container>
				{this.renderButtons()}
			</Container>
		);
	}
}
