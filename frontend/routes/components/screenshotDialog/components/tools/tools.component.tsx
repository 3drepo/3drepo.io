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
import Select from '@material-ui/core/Select';
import BorderColorIcon from '@material-ui/icons/BorderColor';
import ClearIcon from '@material-ui/icons/Clear';
import MenuItem from '@material-ui/core/MenuItem';

import { Eraser } from '../../../fontAwesomeIcon';
import { ToolsContainer, OptionsDivider, StyledButton } from './tools.styles';
import { TooltipButton } from '../../../../teamspaces/components/tooltipButton/tooltipButton.component';
import { ColorPicker } from '../../../colorPicker/colorPicker.component';
import { FONT_WEIGHT } from '../../../../../styles';
import { renderWhenTrue } from '../../../../../helpers/rendering';

interface IProps {
	innerRef: any;
	size: number;
	color: string;
	disabled?: boolean;
	onDrawClick: () => void;
	onEraseClick: () => void;
	onClearClick: () => void;
	onColorChange: (color) => void;
	onBrushSizeChange: (size) => void;
	onCancel: () => void;
	onSave: () => void;
}

const TOOL_TYPES = {
	BRUSH: 1,
	ERASER: 2
};

export class Tools extends React.PureComponent<IProps, any> {
	public state = {
		activeTool: TOOL_TYPES.BRUSH
	};

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

	public renderToolset = renderWhenTrue(() => {
		const { size, color, onDrawClick, onEraseClick, onClearClick, onColorChange, onBrushSizeChange } = this.props;
		return (
			<>
				<ColorPicker disableUnderline={true} value={color} onChange={onColorChange} />
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
					color={this.getToolColor(TOOL_TYPES.BRUSH)}
					action={this.handleToolClick(TOOL_TYPES.BRUSH, onDrawClick)}
					Icon={BorderColorIcon}
				/>
				<TooltipButton
					label="Erase"
					color={this.getToolColor(TOOL_TYPES.ERASER)}
					action={this.handleToolClick(TOOL_TYPES.BRUSH, onEraseClick)}
					Icon={Eraser}
				/>
				<TooltipButton label="Clear" action={onClearClick} Icon={ClearIcon} />
				<OptionsDivider />
			</>
		);
	});

	public renderSaveButton = renderWhenTrue(() => (
		<StyledButton onClick={this.props.onSave} color="secondary" variant="raised">Save</StyledButton>
	));

	public render() {
		const { innerRef, disabled, onCancel } = this.props;

		return (
			<ToolsContainer innerRef={innerRef} disabled={disabled}>
				{this.renderToolset(!disabled)}
				<StyledButton onClick={onCancel} color="primary">Cancel</StyledButton>
				{this.renderSaveButton(!disabled)}
			</ToolsContainer>
		);
	}
}
