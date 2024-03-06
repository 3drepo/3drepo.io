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

import { ButtonOptionsContainer, IconWithFooterContainer } from '../buttons.styles';
import TextIcon from '@assets/icons/outlined/text-outlined.svg';
import { formatMessage } from '@/v5/services/intl';
import { ClickAwayListener } from '@mui/material';
import { FloatingBarItem, FloatingButtonsContainer, FloatingBar } from '../../toolbarButton/multioptionIcons.styles';
import { useState } from 'react';
import { FONT_SIZE } from '../../../imageMarkup.types';
import { invert } from 'lodash';
import { ToolbarButton } from '../../toolbarButton/toolbarButton.component';

const VALUE_TO_SIZE = invert(FONT_SIZE);

type FontSizeButtonProps = {
	value: number,
	onChange: (value: number) => void,
};
export const FontSizeButton = ({ value, onChange }: FontSizeButtonProps) => {
	const [expanded, setExpanded] = useState(false);

	const handleChange = (val: number) => {
		onChange(val);
		setExpanded(false);
	};

	const Icon = () => (
		<IconWithFooterContainer $footer={VALUE_TO_SIZE[value]}>
			<TextIcon />
		</IconWithFooterContainer>
	);

	return (
		<ClickAwayListener onClickAway={() => setExpanded(false)}>
			<ButtonOptionsContainer>
				<FloatingButtonsContainer>
					{expanded && (
						<FloatingBar>
							{Object.entries(FONT_SIZE).map(([key, val]) => (
								<FloatingBarItem onClick={() => handleChange(val)} selected={val === value} key={key}>
									{key}
								</FloatingBarItem>
							))}
						</FloatingBar>
					)}
				</FloatingButtonsContainer>
				<ToolbarButton
					onClick={() => setExpanded(!expanded)}
					Icon={Icon}
					title={formatMessage({ id: 'imageMarkup.icon.title.fontSize', defaultMessage: 'Font size' })}
				/>
			</ButtonOptionsContainer>
		</ClickAwayListener>
	);
};
