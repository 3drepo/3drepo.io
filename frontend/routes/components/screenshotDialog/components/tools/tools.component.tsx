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

import { range } from 'lodash';
import * as React from 'react';

import { MenuItem, Select, Tooltip } from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import BorderColorIcon from '@material-ui/icons/BorderColor';
import ClearIcon from '@material-ui/icons/Clear';
import RedoIcon from '@material-ui/icons/Redo';
import TextIcon from '@material-ui/icons/TextFields';
import UndoIcon from '@material-ui/icons/Undo';

import { renderWhenTrue } from '../../../../../helpers/rendering';
import { FONT_WEIGHT } from '../../../../../styles';
import { TooltipButton } from '../../../../teamspaces/components/tooltipButton/tooltipButton.component';
import { ButtonMenu } from '../../../buttonMenu/buttonMenu.component';
import { ColorPicker } from '../../../colorPicker/colorPicker.component';
import { MenuList } from '../../../filterPanel/components/filtersMenu/filtersMenu.styles';
import { Eraser } from '../../../fontAwesomeIcon';
import { SmallIconButton } from '../../../smallIconButon/smallIconButton.component';
import { MODES } from '../../screenshotDialog.helpers';
import { SHAPE_TYPES } from '../shape/shape.constants';
import { activeShapeIcon, SHAPES_MENU } from './tools.helpers';
import { IconButton, OptionsDivider, ShapeMenuButton, StyledButton, ToolsContainer } from './tools.styles';

interface IProps {
	size: number;
	color: string;
	disabled?: boolean;
	activeShape: number;
	selectedObjectName: string;
	areFutureElements: boolean;
	arePastElements: boolean;
	mode: string;
	onDrawClick: () => void;
	onEraseClick: () => void;
	onTextClick: () => void;
	onShapeClick: (shapeName?) => void;
	onClearClick: () => void;
	onColorChange: (color) => void;
	onBrushSizeChange: (size) => void;
	onUndo: () => void;
	onRedo: () => void;
	onCancel: () => void;
	onSave: () => void;
}

export class Tools extends React.PureComponent<IProps, any> {
	public get isTextSelected() {
		return this.props.selectedObjectName.includes('text');
	}

	public get isShapeSelected() {
		return this.props.selectedObjectName.includes('shape');
	}

	public renderToolset = renderWhenTrue(() => {
		const {
			size, color, onDrawClick, onTextClick, onClearClick,
			onColorChange, onBrushSizeChange, onEraseClick
		} = this.props;

		return (
			<>
				<ColorPicker
					value={color}
					onChange={onColorChange}
					disableUnderline
				/>
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
					action={onDrawClick}
					Icon={BorderColorIcon}
				/>
				<TooltipButton
					label="Add text"
					color={this.getToolColor(MODES.TEXT)}
					action={onTextClick}
					Icon={TextIcon}
				/>
				<ButtonMenu
					renderButton={({ IconProps, Icon, ...props }) => {
						const ActiveIcon = activeShapeIcon(this.props.activeShape || SHAPE_TYPES.RECTANGLE);
						return (
							<>
								<Tooltip title={'Add shape'}>
									<IconButton
										{...props}
										aria-label="Show filters menu"
										aria-haspopup="true"
										color={this.getToolColor(MODES.SHAPE)}
										onClick={this.setDefaultShape}
									>
										<ActiveIcon {...IconProps} />
									</IconButton>
								</Tooltip>
								<ShapeMenuButton>
									<SmallIconButton
										Icon={ArrowDropDownIcon}
										onClick={props.onClick}
									/>
								</ShapeMenuButton>
							</>
						);
					}}
					renderContent={this.renderActionsMenu}
					PaperProps={{ style: { overflow: 'initial', boxShadow: 'none' } }}
					PopoverProps={{ anchorOrigin: { vertical: 'center', horizontal: 'center' } }}
					ButtonProps={{ disabled: false }}
				/>
				<TooltipButton
					label="Erase"
					color={this.getToolColor(MODES.ERASER)}
					action={onEraseClick}
					Icon={(props) => <Eraser IconProps={props} />}
				/>
				<OptionsDivider />
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
				<TooltipButton
					label="Clear all"
					action={onClearClick}
					Icon={ClearIcon}
					disabled={!this.props.arePastElements && !this.props.areFutureElements}
				/>
				<OptionsDivider />
			</>
		);
	});

	public renderSaveButton = renderWhenTrue(() => (
		<StyledButton onClick={this.props.onSave} color="secondary" variant="raised">Save</StyledButton>
	));

	public handleUndo = () => () => {
		this.props.onUndo();
	}

	public handleRedo = () => () => {
		this.props.onRedo();
	}

	public handleShapeClick = (shapeName, menu, e) => {
		menu.close(e);
		this.props.onShapeClick(shapeName);
	}

	public setDefaultShape = () => {
		this.props.onShapeClick(this.props.activeShape || SHAPE_TYPES.RECTANGLE);
	}

	public renderBrushSizes = () => range(56, 1).map((size, index) => (
		<MenuItem key={index} value={size}>{size}</MenuItem>
	))

	public getToolColor = (toolType) => {
		if (this.props.mode === toolType) {
			return 'secondary';
		}
		return 'action';
	}

	public renderActionsMenu = (menu) =>  {
		return(
			<MenuList>
				{SHAPES_MENU.map(({ name, Icon }) => (
					<SmallIconButton
						Icon={Icon}
						key={name}
						onClick={(e) => this.handleShapeClick(name, menu, e)}
					/>
				))}
			</MenuList>
		);
	}

	public handleToolClick = (type, callback?) => () => {
		this.setState({ activeTool: type }, callback);
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
