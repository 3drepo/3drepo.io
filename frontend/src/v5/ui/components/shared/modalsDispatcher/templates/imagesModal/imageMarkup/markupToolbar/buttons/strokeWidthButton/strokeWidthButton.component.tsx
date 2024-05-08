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

import StrokeWidthIcon from '@assets/icons/outlined/stroke_width-outlined.svg';
import { formatMessage } from '@/v5/services/intl';
import { IconWithFooterContainer, FloatingBar } from '../../toolbarButton/multioptionIcons.styles';
import { STROKE_WIDTH } from '../../../imageMarkup.types';
import { FlatToolbarSelectItem, StrokeOption } from './strokeWidthButton.styles';
import { invert } from 'lodash';
import { ToolbarSelect } from '@controls/toolbarSelect/toolbarSelect.component';
import { Tooltip } from '@mui/material';

const VALUE_TO_WIDTH = invert(STROKE_WIDTH);
const Icon = ({ value, title, expanded }) => (
	<Tooltip title={title}>
		<IconWithFooterContainer $footer={VALUE_TO_WIDTH[value]} $expanded={expanded}>
			<StrokeWidthIcon />
		</IconWithFooterContainer>
	</Tooltip>
);

type StrokeWidthButtonProps = {
	value: number,
	onChange: (value: number) => void,
};
export const StrokeWidthButton = ({ value, onChange }: StrokeWidthButtonProps) => (
	<ToolbarSelect
		onChange={onChange}
		renderToolbarButton={Icon}
		value={value}
		active
		title={formatMessage({ id: 'imageMarkup.strokeWidth.button.title', defaultMessage: 'Stroke width' })}
	>
		<FloatingBar>
			{Object.values(STROKE_WIDTH).map((width, index) => (
				<FlatToolbarSelectItem
					value={width}
					key={width}
					Icon={() => <StrokeOption $height={(index + 1) * 2} />}
				/>
			))}
		</FloatingBar>
	</ToolbarSelect>
);
