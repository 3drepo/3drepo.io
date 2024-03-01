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
import TextIcon from '@assets/icons/outlined/text-outlined.svg';
import UnderlinedTextIcon from '@assets/icons/outlined/underlined_text-outlined.svg';
import ItalicTextIcon from '@assets/icons/outlined/italic_text-outlined.svg';
import BoldTextIcon from '@assets/icons/outlined/bold_text-outlined.svg';
import BinIcon from '@assets/icons/outlined/delete-outlined.svg';
import RedoIcon from '@assets/icons/outlined/redo_arrow-outlined.svg';
import UndoIcon from '@assets/icons/outlined/undo_arrow-outlined.svg';
import ResetIcon from '@assets/icons/outlined/cross_sharp_edges-outlined.svg';
import { Button } from '@controls/button';
import { CanvasHistoryActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { CanvasHistoryHooksSelectors } from '@/v5/services/selectorsHooks';
import { Divider, Toolbar } from './markupToolbar.styles';
import { ToolbarButton } from './toolbarButton/toolbarButton.component';
import { ICalloutType, IFontSize, IMode, IShapeType, IStrokeWidth } from '../imageMarkup.types';
import { ModeButtons } from './modeButtons/modeButtons.component';

type MarkupToolbarProps = {
	onSave: () => void,
	onClose: () => void,
	shape: IShapeType,
	color: string,
	selectedObjectName: string,
	strokeWidth: IStrokeWidth,
	mode: IMode,
	fontSize: IFontSize,
	callout: ICalloutType,
	// onSelectedObjectNameChange: (name: string) => void,
	// onModeChange: (mode: IMode) => void,
	// onCursorChange: (cursor: 'crosshair' | 'default') => void,
	// onSelectMode,
	onClearClick,
	onBrushSizeChange,
	onTextSizeChange,
	onColorChange,

	onShapeChange,
	onModeChange,
	onCalloutChange,
};
export const MarkupToolbar = ({
	onSave,
	onClose,
	color,
	strokeWidth,
	shape,
	mode,
	fontSize,
	onClearClick,
	onShapeChange,
	onModeChange,
	callout,
	onCalloutChange,
}: MarkupToolbarProps) => {
	const hasFutureHistory = !!CanvasHistoryHooksSelectors.selectAreFutureElements();
	const hasPastHistory = !!CanvasHistoryHooksSelectors.selectArePastElements();

	return (
		<Toolbar>
			<ToolbarButton
				Icon={() => (<>{color} {mode}</>)}
				title={formatMessage({ id: 'imageMarkup.icon.title.color', defaultMessage: 'color' })}
			/>
			<ToolbarButton
				Icon={() => <>{strokeWidth}</>}
				title={formatMessage({ id: 'imageMarkup.icon.title.strokeWidth', defaultMessage: 'stroke width' })}
			/>
			<ToolbarButton
				Icon={() => <>{fontSize}</>}
				title={formatMessage({ id: 'imageMarkup.icon.title.fontSize', defaultMessage: 'Font size' })}
			/>
			<Divider />
			<ToolbarButton
				Icon={TextIcon}
				title={formatMessage({ id: 'imageMarkup.icon.title.normalText', defaultMessage: 'Normal text' })}
			/>
			<ToolbarButton
				Icon={BoldTextIcon}
				title={formatMessage({ id: 'imageMarkup.icon.title.bold', defaultMessage: 'bold' })}
			/>
			<ToolbarButton
				Icon={ItalicTextIcon}
				title={formatMessage({ id: 'imageMarkup.icon.title.italic', defaultMessage: 'italic' })}
			/>
			<ToolbarButton
				Icon={UnderlinedTextIcon}
				title={formatMessage({ id: 'imageMarkup.icon.title.underlined', defaultMessage: 'underlined' })}
			/>
			<Divider />
			<ModeButtons
				mode={mode}
				onModeChange={onModeChange}
				shape={shape}
				onShapeChange={onShapeChange}
				callout={callout}
				onCalloutChange={onCalloutChange}
			/>
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
			<ToolbarButton
				Icon={BinIcon}
				onClick={onClose}
				title={formatMessage({ id: 'imageMarkup.icon.title.cancel', defaultMessage: 'Cancel' })}
			/>
			<Button onClick={onSave} disabled={!hasPastHistory}>
				Save
			</Button>
		</Toolbar>
	);
};
