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

import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import BorderColorIcon from '@material-ui/icons/BorderColor';
import ClearIcon from '@material-ui/icons/Clear';
import { range } from 'lodash';
import React from 'react';
import TextIcon from '@material-ui/icons/TextFields';
import ChangeHistoryIcon from '@material-ui/icons/ChangeHistory';
import CropSquareIcon from '@material-ui/icons/CropSquare';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';
import RemoveIcon from '@material-ui/icons/Remove';
import PanoramaFishEyeIcon from '@material-ui/icons/PanoramaFishEye';
import MenuItem from '@material-ui/core/MenuItem';

import { renderWhenTrue } from '../../../../../helpers/rendering';
import { FONT_WEIGHT } from '../../../../../styles';
import { TooltipButton } from '../../../../teamspaces/components/tooltipButton/tooltipButton.component';
import { ColorPicker } from '../../../colorPicker/colorPicker.component';
import { Eraser } from '../../../fontAwesomeIcon';
import { OptionsDivider, StyledButton, ToolsContainer } from './tools.styles';
import { FONT_WEIGHT } from '../../../../../styles';
import { renderWhenTrue } from '../../../../../helpers/rendering';
import { MODES } from '../../screenshotDialog.helpers';
import { IconButton, Tooltip } from '@material-ui/core';
import MoreIcon from '@material-ui/icons/MoreVert';
import { ButtonMenu } from '../../../buttonMenu/buttonMenu.component';
import { MenuList, StyledListItem, StyledItemText } from '../../../filterPanel/components/filtersMenu/filtersMenu.styles';
import { SmallIconButton } from '../../../smallIconButon/smallIconButton.component';
import { SHAPE_TYPES } from '../shape/shape.constants';

interface IProps {
	size: number;
	color: string;
	disabled?: boolean;
	onDrawClick: () => void;
	onEraseClick: () => void;
	onTextClick: () => void;
	onShapeClick: (shapeName) => void;
	onClearClick: () => void;
	onColorChange: (color) => void;
	onBrushSizeChange: (size) => void;
	onCancel: () => void;
	onSave: () => void;
}

const SHAPES_MENU = [
	{
		name: SHAPE_TYPES.RECTANGLE,
		Icon: CropSquareIcon
	},
	{
		name: SHAPE_TYPES.TRIANGLE,
		Icon: ChangeHistoryIcon
	},
	{
		name: SHAPE_TYPES.CIRCLE,
		Icon: PanoramaFishEyeIcon
	},
	{
		name: SHAPE_TYPES.LINE,
		Icon: RemoveIcon
	},
	{
		name: SHAPE_TYPES.CLOUD,
		Icon: CloudQueueIcon
	}
];

export class Tools extends React.PureComponent<IProps, any> {
	public state = {
		activeTool: MODES.BRUSH
	};

	public renderToolset = renderWhenTrue(() => {
		const {
			size, color, onDrawClick, onEraseClick, onTextClick, onShapeClick, onClearClick, onColorChange, onBrushSizeChange
		} = this.props;

		return (
			<>
				<ColorPicker disableUnderline value={color} onChange={onColorChange} />
				<Select
					disableUnderline
					value={size}
					onChange={onBrushSizeChange}
					MenuProps={{
						MenuListProps: {
							style: {
								maxHeight: '30vh'
							}
						}
					}}
					SelectDisplayProps={{
						style: {
							fontWeight: FONT_WEIGHT.BOLDER,
							fontSize: '14px',
							paddingRight: '25px',
							textAlign: 'center'
						}
					}}
				>
					{this.renderBrushSizes()}
				</Select>
				<OptionsDivider />
				<TooltipButton
					label="Draw"
					color={this.getToolColor(MODES.BRUSH)}
					action={this.handleToolClick(MODES.BRUSH, onDrawClick)}
					Icon={BorderColorIcon}
				/>
				<TooltipButton
					label="Erase"
					color={this.getToolColor(MODES.ERASER)}
					action={this.handleToolClick(MODES.ERASER, onEraseClick)}
					Icon={(props) => <Eraser IconProps={props} />}
				/>
				<TooltipButton
					label="Add text"
					color={this.getToolColor(MODES.TEXT)}
					action={this.handleToolClick(MODES.TEXT, onTextClick)}
					Icon={TextIcon}
				/>
				<ButtonMenu
					renderButton={({ IconProps, Icon, ...props }) => (
						<Tooltip title={'Add shape'}>
							<IconButton
								{...props}
								aria-label="Show filters menu"
								aria-haspopup="true"
							>
								<ChangeHistoryIcon {...IconProps} />
							</IconButton>
						</Tooltip>
					)}
					renderContent={this.renderActionsMenu}
					PaperProps={{ style: { overflow: 'initial', boxShadow: 'none' } }}
					PopoverProps={{ anchorOrigin: { vertical: 'center', horizontal: 'center' } }}
					ButtonProps={{ disabled: false }}
				/>
				<TooltipButton label="Clear" action={onClearClick} Icon={ClearIcon} />
				<OptionsDivider />
			</>
		);
	});

	public renderActionsMenu = () =>  {
		return(
			<MenuList>
				{SHAPES_MENU.map(({ name, Icon }) => (
					<SmallIconButton
						Icon={Icon}
						key={name}
						onClick={this.handleToolClick(MODES.SHAPE, () => this.props.onShapeClick(name))}
					/>
				))}
			</MenuList>
		);
	}

	public renderSaveButton = renderWhenTrue(() => (
		<StyledButton onClick={this.props.onSave} color="secondary" variant="raised">Save</StyledButton>
	));

	public handleToolClick = (type, callback?) => () => {
		this.setState({ activeTool: type }, callback);
	}

	public renderBrushSizes = () => range(56, 1).map((size, index) => (
		<MenuItem key={index} value={size}>{size}</MenuItem>
	))

	public getToolColor = (toolType) => {
		if (this.state.activeTool === toolType) {
			return 'secondary';
		}
		return 'action';
	}

	public render() {
		const { disabled, onCancel } = this.props;

		return (
			<ToolsContainer disabled={disabled}>
				{this.renderToolset(!disabled)}
				<StyledButton onClick={onCancel} color="primary">Cancel</StyledButton>
				{this.renderSaveButton(!disabled)}
			</ToolsContainer>
		);
	}
}
