/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { formatMessage } from '@/v5/services/intl';
import DrawIcon from '@assets/icons/outlined/draw-outlined.svg';
import EraserIcon from '@assets/icons/outlined/eraser-outlined.svg';
import TextIcon from '@assets/icons/outlined/text-outlined.svg';
import RedoIcon from '@assets/icons/outlined/redo_arrow-outlined.svg';
import UndoIcon from '@assets/icons/outlined/undo_arrow-outlined.svg';
import ResetIcon from '@assets/icons/outlined/cross-outlined.svg';
import SaveIcon from '@assets/icons/outlined/save-outlined.svg';
import { CanvasHistoryActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { CanvasHistoryHooksSelectors } from '@/v5/services/selectorsHooks';
import { Divider, SaveButton, Toolbar } from './markupToolbar.styles';
import { ToolbarButton } from './toolbarButton/toolbarButton.component';
import { ICalloutType, IFontSize, IMode, IShapeType, IStrokeWidth } from '../imageMarkup.types';
import { MODES } from '@/v4/routes/components/screenshotDialog/markupStage/markupStage.helpers';
import { ShapeButton } from './shapeButton/shapeButton.component';
import { CalloutButton } from './buttons/calloutButton/calloutButton.component';
import { ColorButton } from './buttons/colorButton/colorButton.component';
import { FontSizeButton } from './buttons/fontSizeButton/fontSizeButton.component';
import { StrokeWidthButton } from './buttons/strokeWidthButton/strokeWidthButton.component';

type MarkupToolbarProps = {
	onSave: () => void,
	shape: IShapeType,
	color: string,
	selectedObjectName: string,
	strokeWidth: IStrokeWidth,
	mode: IMode,
	fontSize: IFontSize,
	callout: ICalloutType,
	onClearClick,
	onStrokeWidthChange,
	onFontSizeChange,
	onColorChange,

	onShapeChange,
	onModeChange,
	onCalloutChange,
	allowSaveWithoutChanges?: boolean,
};
export const MarkupToolbar = ({
	onSave,
	color,
	onColorChange,
	strokeWidth,
	onStrokeWidthChange,
	fontSize,
	onFontSizeChange,
	shape,
	onShapeChange,
	mode,
	onModeChange,
	callout,
	onCalloutChange,
	onClearClick,
	allowSaveWithoutChanges,
}: MarkupToolbarProps) => {
	const hasFutureHistory = !!CanvasHistoryHooksSelectors.selectAreFutureElements();
	const hasPastHistory = !!CanvasHistoryHooksSelectors.selectArePastElements();

	return (
		<Toolbar>
			<ColorButton value={color} onChange={onColorChange} />
			<StrokeWidthButton value={strokeWidth} onChange={onStrokeWidthChange} />
			<FontSizeButton value={fontSize} onChange={onFontSizeChange} />
			<Divider />
			<ToolbarButton
				Icon={DrawIcon}
				title={formatMessage({ id: 'imageMarkup.icon.title.draw', defaultMessage: 'Draw' })}
				selected={mode === MODES.BRUSH}
				onClick={() => onModeChange(MODES.BRUSH)}
			/>
			<ToolbarButton
				Icon={EraserIcon}
				title={formatMessage({ id: 'imageMarkup.icon.title.erase', defaultMessage: 'Erase' })}
				selected={mode === MODES.ERASER}
				onClick={() => onModeChange(MODES.ERASER)}
			/>
			<ToolbarButton
				Icon={TextIcon}
				title={formatMessage({ id: 'imageMarkup.icon.title.text', defaultMessage: 'Text' })}
				selected={mode === MODES.TEXT}
				onClick={() => onModeChange(MODES.TEXT)}
			/>
			<ShapeButton value={shape} onChange={onShapeChange} mode={mode} />
			<CalloutButton value={callout} onChange={onCalloutChange} mode={mode} />
			<Divider />
			<ToolbarButton
				Icon={UndoIcon}
				title={formatMessage({ id: 'imageMarkup.icon.title.undo', defaultMessage: 'Undo' })}
				disabled={!hasPastHistory}
				onClick={CanvasHistoryActionsDispatchers.undo}
			/>
			<ToolbarButton
				Icon={RedoIcon}
				title={formatMessage({ id: 'imageMarkup.icon.title.redo', defaultMessage: 'Redo' })}
				onClick={CanvasHistoryActionsDispatchers.redo}
				disabled={!hasFutureHistory}
			/>
			<ToolbarButton
				Icon={ResetIcon}
				title={formatMessage({ id: 'imageMarkup.icon.title.reset', defaultMessage: 'Reset' })}
				onClick={onClearClick}
				disabled={!hasFutureHistory && !hasPastHistory}
			/>
			<Divider />
			<SaveButton onClick={onSave} disabled={!hasPastHistory && !allowSaveWithoutChanges}>
				<SaveIcon />
			</SaveButton>
		</Toolbar>
	);
};
