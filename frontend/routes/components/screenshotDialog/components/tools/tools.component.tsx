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
import { range } from 'lodash';
import BorderColorIcon from '@material-ui/icons/BorderColor';
import ClearIcon from '@material-ui/icons/Clear';
import TextIcon from '@material-ui/icons/TextFields';
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import { MenuItem, Tooltip, Select } from '@material-ui/core';

import { renderWhenTrue } from '../../../../../helpers/rendering';
import { FONT_WEIGHT } from '../../../../../styles';
import { ToolsContainer, OptionsDivider, StyledButton, IconButton } from './tools.styles';
import { TooltipButton } from '../../../../teamspaces/components/tooltipButton/tooltipButton.component';
import { ColorPicker } from '../../../colorPicker/colorPicker.component';
import { MODES } from '../../screenshotDialog.helpers';
import { ButtonMenu } from '../../../buttonMenu/buttonMenu.component';
import { MenuList } from '../../../filterPanel/components/filtersMenu/filtersMenu.styles';
import { SmallIconButton } from '../../../smallIconButon/smallIconButton.component';
import { SHAPES_MENU, activeShapeIcon } from './tools.helpers.tsx';
import { SHAPE_TYPES } from '../shape/shape.constants';

interface IProps {
	size: number;
	color: string;
	disabled?: boolean;
	activeShape: number;
	selectedObjectName: string;
	areFutureElements: boolean;
	arePastElements: boolean;
	onDrawClick: () => void;
	onEraseClick: () => void;
	onTextClick: () => void;
	onShapeClick: (shapeName) => void;
	onClearClick: () => void;
	onColorChange: (color) => void;
	onBrushSizeChange: (size) => void;
	onUndo: () => void;
	onRedo: () => void;
	onCancel: () => void;
	onSave: () => void;
}

export class Tools extends React.PureComponent<IProps, any> {
	public state = {
		activeTool: MODES.BRUSH
	};

	public get isTextSelected() {
		return this.props.selectedObjectName.includes('text');
	}

	public get isShapeSelected() {
		return this.props.selectedObjectName.includes('shape');
	}

	public handleToolClick = (activeTool, callback?) => () => {
		this.setState({ activeTool }, callback);
	}

	public handleUndo = () => () => {
		this.props.onUndo();
	}

	public handleRedo = () => () => {
		this.props.onRedo();
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

	public renderToolset = renderWhenTrue(() => {
		const {
			size, color, onDrawClick, onEraseClick, onTextClick, onClearClick, onColorChange, onBrushSizeChange
		} = this.props;

		return (
			<>
				<ColorPicker disableUnderline value={color} onChange={onColorChange} />
				<Select
					disableUnderline
					value={size}
					onChange={onBrushSizeChange}
					disabled={this.isShapeSelected}
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
					label="Add text"
					color={this.isTextSelected ? this.getToolColor(MODES.TEXT) : 'action'}
					action={this.handleToolClick(MODES.TEXT, onTextClick)}
					Icon={TextIcon}
				/>
				<ButtonMenu
					renderButton={({ IconProps, Icon, ...props }) => {
						const ActiveIcon = activeShapeIcon(this.props.activeShape || SHAPE_TYPES.RECTANGLE);
						return (
							<Tooltip title={'Add shape'}>
								<IconButton
									{...props}
									aria-label="Show filters menu"
									aria-haspopup="true"
									color={this.isShapeSelected ? 'secondary' : 'action'}
								>
									<ActiveIcon {...IconProps} />
								</IconButton>
							</Tooltip>
						);
					}}
					renderContent={this.renderActionsMenu}
					PaperProps={{ style: { overflow: 'initial', boxShadow: 'none' } }}
					PopoverProps={{ anchorOrigin: { vertical: 'center', horizontal: 'center' } }}
					ButtonProps={{ disabled: false }}
				/>
				<TooltipButton label="Clear all" action={onClearClick} Icon={ClearIcon} />
				<TooltipButton
					label="Undo"
					action={this.handleUndo()}
					Icon={UndoIcon}
					disabled={!this.props.arePastElements}
				/>
				<TooltipButton
					label="Redo"
					action={this.handleRedo()}
					Icon={RedoIcon}
					disabled={!this.props.areFutureElements}
				/>
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
