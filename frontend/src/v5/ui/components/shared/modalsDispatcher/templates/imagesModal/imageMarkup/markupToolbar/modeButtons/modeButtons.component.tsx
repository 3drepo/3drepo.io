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
import { MODES } from '@/v4/routes/components/screenshotDialog/markupStage/markupStage.helpers';
import DrawIcon from '@assets/icons/outlined/draw-outlined.svg';
import EraserIcon from '@assets/icons/outlined/eraser-outlined.svg';
import TextIcon from '@assets/icons/outlined/text-outlined.svg';

import { ToolbarButton } from '../toolbarButton/toolbarButton.component';
import { ShapeButton } from './shapeButton.component';
import { CalloutButton } from './calloutButton.component';

export const ModeButtons = ({ mode, onModeChange, shape, onShapeChange, callout, onCalloutChange }) => {
	return (
		<>
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
				title={formatMessage({ id: 'imageMarkup.icon.title.erase', defaultMessage: 'Text' })}
				selected={mode === MODES.TEXT}
				onClick={() => onModeChange(MODES.TEXT)}
			/>
			<ShapeButton shape={shape} onShapeChange={onShapeChange} mode={mode} />
			<CalloutButton callout={callout} onCalloutChange={onCalloutChange} mode={mode} />
		</>
	);
};
