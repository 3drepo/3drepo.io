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

import * as React from 'react';

import { MenuItem, Select, Tooltip } from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import BorderColorIcon from '@material-ui/icons/BorderColor';
import ClearIcon from '@material-ui/icons/Clear';
import DotIcon from '@material-ui/icons/FiberManualRecord';
import RedoIcon from '@material-ui/icons/Redo';
import TextIcon from '@material-ui/icons/TextFields';
import UndoIcon from '@material-ui/icons/Undo';

import { lerp } from '../../../../../helpers/lerp';
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
import {
	activeShapeIcon,
	BRUSH_SIZES,
	MAX_TOOL_ICON_SIZE,
	MIN_BRUSH_ICON_SIZE,
	MIN_TEXT_ICON_SIZE,
	SHAPES_MENU,
	TEXT_SIZES
} from './tools.helpers';
import { Badge, IconButton, OptionsDivider, ShapeMenuButton, StyledButton, ToolsContainer } from './tools.styles';

const ACTIVE_COLOR = 'secondary';
const PRIMARY_COLOR = 'primary';
const ACTION_COLOR = 'action';

interface IProps {
	size: number;
	textSize: number;
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
	onTextSizeChange: (size) => void;
	onUndo: () => void;
	onRedo: () => void;
	onSave: () => void;
}

export class Tools extends React.PureComponent<IProps, any> {
	public renderToolset = renderWhenTrue(() => {
		const {
			size, textSize, color, onDrawClick, onTextClick, onClearClick,
			onColorChange, onBrushSizeChange, onEraseClick, onTextSizeChange,
		} = this.props;

		return (
			<>
				<ColorPicker
					value={color}
					onChange={onColorChange}
					disableUnderline
				/>
				{this.renderSelectableTools(size, onBrushSizeChange, this.renderBrushSizes())}
				{this.renderSelectableTools(textSize, onTextSizeChange, this.renderTextSizes())}
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
										aria-label="Show shapes menu"
										aria-haspopup="true"
										color={this.getShapeToolColor()}
										onClick={this.setDefaultShape}
									>
										<ActiveIcon color={this.getShapeToolColor()} {...IconProps} />
									</IconButton>
								</Tooltip>
								<ShapeMenuButton>
									<SmallIconButton
										Icon={ArrowDropDownIcon}
										onClick={(e) => {
											props.onClick(e);
										}}
									/>
								</ShapeMenuButton>
							</>
						);
					}}
					renderContent={this.renderShapesMenu}
					PaperProps={{ style: { overflow: 'initial', boxShadow: 'none' } }}
					PopoverProps={{ anchorOrigin: { vertical: 'center', horizontal: 'center' } }}
					ButtonProps={{ disabled: false }}
				/>
				<TooltipButton
					label="Erase"
					color={this.getToolColor(MODES.ERASER)}
					action={onEraseClick}
					Icon={(props) => <Eraser {...props} />}
				/>
				<OptionsDivider />
				<TooltipButton
					label="Undo"
					action={this.handleUndo}
					Icon={UndoIcon}
					disabled={!this.props.arePastElements}
				/>
				<TooltipButton
					label="Redo"
					action={this.handleRedo}
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
			<StyledButton onClick={this.props.onSave} color="secondary" variant="contained">Save</StyledButton>
	));

	public renderSelectableTools = (value, onChange, items) => (
		<Select
			disableUnderline
			value={value}
			onChange={onChange}
			MenuProps={{
				MenuListProps: {
					style: {
						maxHeight: '30vh'
					}
				},
				getContentAnchorEl: null,
				anchorOrigin: {
					vertical: 'top',
					horizontal: 'left',
				},
				transformOrigin: {
					vertical: 'bottom',
					horizontal: 'left',
				},
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
			{items}
		</Select>
	)

	public handleUndo = () => {
		this.props.onUndo();
	}

	public handleRedo = () => {
		this.props.onRedo();
	}

	public handleShapeClick = (shapeName, menu, e) => {
		menu.close(e);
		this.props.onShapeClick(shapeName);
	}

	public setDefaultShape = () => {
		this.props.onShapeClick(this.props.activeShape || SHAPE_TYPES.RECTANGLE);
	}

	public renderBrushSizes = () => BRUSH_SIZES.map(({ label, value }) => (
		<MenuItem key={value} value={value}>
			<IconButton disableRipple>
				<Badge badgeContent={label} color="primary">
					<DotIcon
						style={{
							fontSize: lerp(MIN_BRUSH_ICON_SIZE, MAX_TOOL_ICON_SIZE, value / BRUSH_SIZES[0].value)
						}}
					/>
				</Badge>
			</IconButton>
		</MenuItem>
	))

	public renderTextSizes = () => TEXT_SIZES.map(({ label, value }, index) => (
		<MenuItem key={value} value={value}>
			<IconButton disableRipple>
				<Badge badgeContent={label} color="primary">
					<TextIcon
						style={{
							fontSize: lerp(MAX_TOOL_ICON_SIZE, MIN_TEXT_ICON_SIZE, (index + 1) / TEXT_SIZES.length)
						}}
					/>
				</Badge>
			</IconButton>
		</MenuItem>
	))

	public getToolColor = (toolType) => {
		if (this.props.mode === toolType) {
			return ACTIVE_COLOR;
		}
		return ACTION_COLOR;
	}

	public getShapeToolColor = () => {
		return [MODES.SHAPE, MODES.POLYGON, MODES.CALLOUT].includes(this.props.mode) ? ACTIVE_COLOR : PRIMARY_COLOR;
	}

	public renderShapesMenu = (menu) =>  {
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

	public render() {
		const { disabled } = this.props;

		return (
			<ToolsContainer disabled={disabled}>
				{this.renderToolset(!disabled)}
				{this.renderSaveButton(!disabled)}
			</ToolsContainer>
		);
	}
}
