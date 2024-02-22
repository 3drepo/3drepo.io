/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import SquareCalloutIcon from '@assets/icons/outlined/callout_square-outlined.svg';
import CircleIcon from '@assets/icons/outlined/circle-outlined.svg';
import DrawIcon from '@assets/icons/outlined/draw-outlined.svg';
import EraserIcon from '@assets/icons/outlined/eraser-outlined.svg';
import ResetIcon from '@assets/icons/outlined/cross_sharp_edges-outlined.svg';
import { ToolbarButton } from '@/v5/ui/routes/viewer/toolbar/buttons/toolbarButton.component';
import { Button } from '@controls/button';
import { Toolbar, Divider } from './markupToolbar.styles';

type MarkupToolbarProps = { onSave: () => void, onClose: () => void };
export const MarkupToolbar = ({ onSave, onClose }: MarkupToolbarProps) => {
	return (
		<Toolbar>
			<ToolbarButton
				Icon={() => (<>0</>)}
				title={formatMessage({ id: 'imageMarkup.icon.title.color', defaultMessage: 'color' })}
			/>
			<ToolbarButton
				Icon={() => <>icon</>}
				title={formatMessage({ id: 'imageMarkup.icon.title.strokeWidth', defaultMessage: 'stroke width' })}
			/>
			<ToolbarButton
				Icon={() => <>icon</>}
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
			<ToolbarButton
				Icon={DrawIcon}
				title={formatMessage({ id: 'imageMarkup.icon.title.draw', defaultMessage: 'Draw' })}
			/>
			<ToolbarButton
				Icon={EraserIcon}
				title={formatMessage({ id: 'imageMarkup.icon.title.erase', defaultMessage: 'Erase' })}
			/>
			<ToolbarButton
				Icon={CircleIcon}
				title={formatMessage({ id: 'imageMarkup.icon.title.shape', defaultMessage: 'Shape' })}
			/>
			<ToolbarButton
				Icon={SquareCalloutIcon}
				title={formatMessage({ id: 'imageMarkup.icon.title.callout', defaultMessage: 'Callout' })}
			/>
			<Divider />
			<ToolbarButton
				Icon={UndoIcon}
				title={formatMessage({ id: 'imageMarkup.icon.title.undo', defaultMessage: 'Undo' })}
			/>
			<ToolbarButton
				Icon={RedoIcon}
				title={formatMessage({ id: 'imageMarkup.icon.title.redo', defaultMessage: 'Redo' })}
			/>
			<ToolbarButton
				Icon={ResetIcon}
				title={formatMessage({ id: 'imageMarkup.icon.title.reset', defaultMessage: 'Reset' })}
			/>
			<Divider />
			<ToolbarButton
				Icon={BinIcon}
				onClick={onClose}
				title={formatMessage({ id: 'imageMarkup.icon.title.cancel', defaultMessage: 'Cancel' })}
			/>
			<Button onClick={onSave}>
				Save
			</Button>
		</Toolbar>
	);
};
