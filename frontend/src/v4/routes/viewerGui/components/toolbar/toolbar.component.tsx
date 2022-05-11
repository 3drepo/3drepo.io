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
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Fade from '@mui/material/Fade';
import FocusIcon from '@mui/icons-material/CenterFocusStrong';
import ClipIcon from '@mui/icons-material/Crop';
import HomeIcon from '@mui/icons-material/Home';
import MetadataIcon from '@mui/icons-material/Info';
import InvertColorsOffIcon from '@mui/icons-material/InvertColorsOff';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import TurntableIcon from '@mui/icons-material/Redo';
import ShowAllIcon from '@mui/icons-material/Visibility';
import HideIcon from '@mui/icons-material/VisibilityOff';
import IsolateIcon from '@mui/icons-material/VisibilityOutlined';
import IncreaseIcon from '@mui/icons-material/Add';
import DecreaseIcon from '@mui/icons-material/Remove';
import ResetIcon from '@mui/icons-material/Replay';

import { renderWhenTrue } from '../../../../helpers/rendering';
import { Helicopter } from '../../../components/fontAwesomeIcon';
import {
	INITIAL_HELICOPTER_SPEED,
	MAX_HELICOPTER_SPEED,
	MIN_HELICOPTER_SPEED,
	VIEWER_CLIP_MODES,
	VIEWER_NAV_MODES,
	VIEWER_PROJECTION_MODES,
	VIEWER_TOOLBAR_ITEMS
} from '../../../../constants/viewer';
import { VIEWER_PANELS } from '../../../../constants/viewerGui';
import {
	ButtonWrapper,
	ClipIconWrapper,
	ClipNumber,
	Container,
	OrthogonalIcon,
	PerspectiveIcon,
	Submenu,
	SubmenuDot,
	ToolbarButton
} from './toolbar.styles';

const HelicopterIcon = () => <Helicopter className="fontSizeSmall" />;

interface IProps {
	teamspace: string;
	model: string;
	projectionMode: string;
	navigationMode: string;
	helicopterSpeed: number;
	isFocusMode: boolean;
	clippingMode: string;
	isClipEdit: boolean;
	clipNumber: number;
	coordViewActive: boolean;
	isMetadataActive: boolean;
	metaKeysExist: boolean;
	isMetadataVisible: boolean;
	goToExtent: () => void;
	setProjectionMode: (mode) => void;
	setNavigationMode: (navigationMode) => void;
	initialiseToolbar: () => void;
	increaseHelicopterSpeed: (teamspace, modelId) => void;
	decreaseHelicopterSpeed: (teamspace, modelId) => void;
	resetHelicopterSpeed: (teamspace, modelId, updateDefaultSpeed) => void;
	showAllNodes: () => void;
	hideSelectedNodes: () => void;
	isolateSelectedNodes: (nodeId) => void;
	setIsFocusMode: (isFocusMode) => void;
	setClippingMode: (clippingMode) => void;
	setClipEdit: (isClipEdit) => void;
	setMetadataActive: (isActive) => void;
	setMeasureMode: (mode) => void;
	setCoordView: (visible) => void;
	stopListenOnNumClip: () => void;
	setPanelVisibility: (panelName, visibility) => void;
	clearColorOverrides: () => void;
}

interface IState {
	activeButton: string;
	activeSubMenu: string;
}

const ClipIconWithNumber = ({clipNumber}) => (
	<ClipIconWrapper>
		<ClipNumber>{clipNumber}</ClipNumber>
		<ClipIcon />
	</ClipIconWrapper>
);

export class Toolbar extends PureComponent<IProps, IState> {
	public state = {
		activeButton: '',
		activeSubMenu: ''
	};

	public get toolbarList() {
		return [
			{
				label: VIEWER_TOOLBAR_ITEMS.EXTENT,
				Icon: HomeIcon,
				action: this.props.goToExtent
			},
			{
				label: VIEWER_TOOLBAR_ITEMS.PERSPECTIVE_VIEW,
				Icon: PerspectiveIcon,
				action: () => this.handleShowSubmenu(VIEWER_TOOLBAR_ITEMS.PERSPECTIVE_VIEW),
				show: this.props.projectionMode !== VIEWER_PROJECTION_MODES.ORTHOGRAPHIC,
				subMenu: [
					{
						label: VIEWER_TOOLBAR_ITEMS.ORTHOGRAPHIC_VIEW,
						Icon: OrthogonalIcon,
						action: () => this.handleProjectionModeClick(VIEWER_PROJECTION_MODES.ORTHOGRAPHIC)
					}
				]
			},
			{
				label: VIEWER_TOOLBAR_ITEMS.ORTHOGRAPHIC_VIEW,
				Icon: OrthogonalIcon,
				action: () => this.handleShowSubmenu(VIEWER_TOOLBAR_ITEMS.ORTHOGRAPHIC_VIEW),
				show: this.props.projectionMode === VIEWER_PROJECTION_MODES.ORTHOGRAPHIC,
				subMenu: [
					{
						label: VIEWER_TOOLBAR_ITEMS.PERSPECTIVE_VIEW,
						Icon: PerspectiveIcon,
						action: () => this.handleProjectionModeClick(VIEWER_PROJECTION_MODES.PERSPECTIVE)
					}
				]
			},
			{
				label: VIEWER_TOOLBAR_ITEMS.TURNTABLE,
				Icon: TurntableIcon,
				action: () => this.handleShowSubmenu(VIEWER_TOOLBAR_ITEMS.TURNTABLE),
				show: this.props.navigationMode === VIEWER_NAV_MODES.TURNTABLE,
				subMenu: [
					{
						label: VIEWER_TOOLBAR_ITEMS.HELICOPTER,
						Icon: HelicopterIcon,
						action: () => this.handleNavigationModeClick(VIEWER_NAV_MODES.HELICOPTER)
					}
				]
			},
			{
				label: VIEWER_TOOLBAR_ITEMS.HELICOPTER,
				Icon: HelicopterIcon,
				action: () => this.handleShowSubmenu(VIEWER_TOOLBAR_ITEMS.HELICOPTER),
				show: this.props.navigationMode === VIEWER_NAV_MODES.HELICOPTER,
				subMenu: [
					{
						label: `Reset speed to ${INITIAL_HELICOPTER_SPEED}`,
						Icon: ResetIcon,
						action: () => this.props.resetHelicopterSpeed(this.props.teamspace, this.props.model, true),
						specificOption: true
					},
					{
						label: `Increase speed to ${this.props.helicopterSpeed + 1}`,
						Icon: IncreaseIcon,
						action: () => this.props.increaseHelicopterSpeed(this.props.teamspace, this.props.model),
						specificOption: true,
						disabled: this.props.helicopterSpeed === MAX_HELICOPTER_SPEED
					},
					{
						label: `Decrease speed to ${this.props.helicopterSpeed - 1}`,
						Icon: DecreaseIcon,
						action: () => this.props.decreaseHelicopterSpeed(this.props.teamspace, this.props.model),
						specificOption: true,
						disabled: this.props.helicopterSpeed === MIN_HELICOPTER_SPEED
					},
					{
						label: VIEWER_TOOLBAR_ITEMS.TURNTABLE,
						Icon: TurntableIcon,
						action: () => this.handleNavigationModeClick(VIEWER_NAV_MODES.TURNTABLE)
					}
				]
			},
			{
				label: VIEWER_TOOLBAR_ITEMS.SHOW_ALL,
				Icon: ShowAllIcon,
				action: this.props.showAllNodes
			},
			{
				label: VIEWER_TOOLBAR_ITEMS.HIDE,
				Icon: HideIcon,
				action: this.props.hideSelectedNodes
			},
			{
				label: VIEWER_TOOLBAR_ITEMS.ISOLATE,
				Icon: IsolateIcon,
				action: () => this.props.isolateSelectedNodes(undefined)
			},
			{
				label: VIEWER_TOOLBAR_ITEMS.CLEAR_OVERRIDE,
				Icon: InvertColorsOffIcon,
				action: () => this.props.clearColorOverrides()
			},

			{
				label: VIEWER_TOOLBAR_ITEMS.FOCUS,
				Icon: FocusIcon,
				action: () => this.props.setIsFocusMode(true)
			},
			{
				label: VIEWER_TOOLBAR_ITEMS.CLIP,
				Icon: ClipIcon,
				action: () => this.handleShowSubmenu(VIEWER_TOOLBAR_ITEMS.CLIP),
				show: this.props.clipNumber === 0,
				subMenu: [
					{
						label: 'Start box clip',
						Icon: () => <ClipIconWithNumber clipNumber={6} />,
						action: () => this.props.setClippingMode(VIEWER_CLIP_MODES.BOX)
					},
					{
						label: 'Start single clip',
						Icon: () => <ClipIconWithNumber clipNumber={1} />,
						action: () => this.props.setClippingMode(VIEWER_CLIP_MODES.SINGLE)
					}
				]
			},
			{
				label: VIEWER_TOOLBAR_ITEMS.CLIP,
				Icon: () =>	<ClipIconWithNumber clipNumber={this.props.clipNumber} />,
				action: this.handleClipEdit,
				show: this.props.clipNumber,
				active: this.props.isClipEdit
			},
			{
				label: VIEWER_TOOLBAR_ITEMS.COORDVIEW,
				Icon: MyLocationIcon,
				action: this.toggleCoordView,
				active: this.props.coordViewActive
			},
			{
				label: VIEWER_TOOLBAR_ITEMS.BIM,
				Icon: MetadataIcon,
				action: this.toggleMetadataPanel,
				active: this.props.isMetadataActive,
				disabled: !this.props.metaKeysExist
			}
		];
	}

	public renderSubmenuDot = renderWhenTrue(() => (
		<SubmenuDot />
	));

	public componentDidMount() {
		this.props.initialiseToolbar();
	}

	public componentDidUpdate(prevProps) {
		if (!this.props.clippingMode && prevProps.clippingMode) {
			this.setState({ activeSubMenu: '' });
		}
	}

	public componentWillUnmount() {
		if (this.props.isMetadataActive) {
			this.toggleMetadataPanel();
		}

		this.props.stopListenOnNumClip();
	}

	public handleNavigationModeClick = (mode) => {
		this.props.setNavigationMode(mode);
		this.setState({ activeSubMenu: '' });
	}

	public handleProjectionModeClick = (mode) => {
		this.props.setProjectionMode(mode);
	}

	public handleClickAway = () => {
		this.setState({ activeSubMenu: '' });
	}

	public handleShowSubmenu = (label) => {
		this.setState((prevState) => ({
			activeSubMenu: prevState.activeSubMenu !== label ? label : ''
		}));
	}

	public renderButtons = () => {
		return this.toolbarList.map(({ show = true, subMenu = [], ...button }, index) => renderWhenTrue(() => (
			<ButtonWrapper key={index}>
				<ToolbarButton
					variant="primary"
					label={button.label}
					Icon={button.Icon}
					action={button.action}
					active={button.active}
					disabled={button.disabled}
					placement="top"
				>
					{this.renderSubmenuDot(subMenu.length)}
				</ToolbarButton>
				{this.renderSubmenu(subMenu, button.label)}
			</ButtonWrapper>
		))(show));
	}

	public renderSubmenu = (subMenu, label) => renderWhenTrue(() => {
		const condition = this.state.activeSubMenu === label;
		return (
			<Fade in={condition}>
				<div>
					<ClickAwayListener onClickAway={this.handleClickAway}>
						<Submenu>{subMenu.map((subButton, subKey) => (
							<ToolbarButton
								key={subKey}
								variant="secondary"
								coloured={subButton.specificOption ? 1 : 0}
								label={subButton.label}
								Icon={subButton.Icon}
								action={subButton.action}
								disabled={subButton.disabled}
							/>)
						)}
						</Submenu>
					</ClickAwayListener>
				</div>
			</Fade>
		);
	})(subMenu.length && this.state.activeSubMenu === label)

	public render() {
		return (
			<Container visible={!this.props.isFocusMode} id="bottom-toolbar">
				{this.renderButtons()}
			</Container>
		);
	}

	private handleClipEdit = () => {
		this.props.setClipEdit(!this.props.isClipEdit);
	}

	private toggleMetadataPanel = () => {
		const {
			isMetadataActive,
			setMetadataActive,
			setPanelVisibility,
			setMeasureMode,
		} = this.props;
		setMetadataActive(!isMetadataActive);
		setPanelVisibility(VIEWER_PANELS.BIM, !isMetadataActive);
		setPanelVisibility(VIEWER_PANELS.ACTIVITIES, false);

		if (!isMetadataActive) {
			setMeasureMode('');
		}
	}

	private toggleCoordView = () => {
		const { coordViewActive, setCoordView} = this.props;
		setCoordView(!coordViewActive);
	}
}
