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

import { IconWithFooterContainer, FlatToolbarSelectItem, FloatingBar } from '../../toolbarButton/multioptionIcons.styles';
import TextIcon from '@assets/icons/outlined/text-outlined.svg';
import { formatMessage } from '@/v5/services/intl';
import { FONT_SIZE } from '../../../imageMarkup.types';
import { invert } from 'lodash';
import { Tooltip } from '@mui/material';
import { ToolbarSelect } from '@controls/toolbarSelect/toolbarSelect.component';

const VALUE_TO_SIZE = invert(FONT_SIZE);
const Icon = ({ value, title }) => (
	<Tooltip title={title}>
		<IconWithFooterContainer $footer={VALUE_TO_SIZE[value]}>
			<TextIcon />
		</IconWithFooterContainer>
	</Tooltip>
);

type FontSizeButtonProps = {
	value: number,
	onChange: (value: number) => void,
};
export const FontSizeButton = ({ value, onChange }: FontSizeButtonProps) => (
	<ToolbarSelect
		onChange={onChange}
		renderToolbarButton={Icon}
		value={value}
		active
		title={formatMessage({ id: 'imageMarkup.fontSize.button.title', defaultMessage: 'Font size' })}
	>
		<FloatingBar>
			{Object.entries(FONT_SIZE).map(([key, val]) => (
				<FlatToolbarSelectItem
					Icon={() => <span>{key}</span>}
					value={val}
					key={key}
				/>
			))}
		</FloatingBar>
	</ToolbarSelect>
);
