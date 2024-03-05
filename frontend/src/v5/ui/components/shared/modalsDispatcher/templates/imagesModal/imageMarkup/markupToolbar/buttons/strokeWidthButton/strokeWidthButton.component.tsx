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
import { ClickAwayListener } from '@mui/material';
import { useState } from 'react';
import { ButtonOptionsContainer, IconWithFooterContainer } from '../buttons.styles';
import { STROKE_WIDTH } from '../../../imageMarkup.types';
import { FloatingBarItem, StrokeOption } from './strokeWidthButton.styles';
import { invert } from 'lodash';
import { FloatingBar, FloatingButtonsContainer } from '../../toolbarButton/multioptionIcons.styles';
import { ToolbarButton } from '../../toolbarButton/toolbarButton.component';

const VALUE_TO_WIDTH = invert(STROKE_WIDTH);

type StrokeWidthButtonProps = {
	value: number,
	onChange: (value: number) => void,
};
export const StrokeWidthButton = ({ value, onChange }: StrokeWidthButtonProps) => {
	const [expanded, setExpanded] = useState(false);

	const handleChange = (val: number) => {
		onChange(val);
		setExpanded(false);
	};

	const Icon = () => (
		<IconWithFooterContainer $footer={VALUE_TO_WIDTH[value]}>
			<StrokeWidthIcon />
		</IconWithFooterContainer>
	);

	return (
		<ClickAwayListener onClickAway={() => setExpanded(false)}>
			<ButtonOptionsContainer>
				<FloatingButtonsContainer>
					{expanded && (
						<FloatingBar>
							{Object.values(STROKE_WIDTH).map((width, index) => (
								<FloatingBarItem onClick={() => handleChange(width)}>
									<StrokeOption selected={width === value} $height={(index + 1) * 2} />
								</FloatingBarItem>
							))}
						</FloatingBar>
					)}
				</FloatingButtonsContainer>
				<ToolbarButton
					Icon={Icon}
					onClick={() => setExpanded(!expanded)}
					title={formatMessage({ id: 'imageMarkup.icon.title.strokeWidth', defaultMessage: 'Stroke width' })}
				/>
			</ButtonOptionsContainer>
		</ClickAwayListener>
	);
};
