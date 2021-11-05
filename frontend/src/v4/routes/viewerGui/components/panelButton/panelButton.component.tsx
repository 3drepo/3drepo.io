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

import React from 'react';

import { VIEWER_PANELS_ICONS } from '../../../../constants/viewerGui';
import { Button, ButtonWrapper } from './panelButton.styles';

export const PanelButton = (props) => {
	const { active, label, onClick, type, className, disabled } = props;

	const handleClick = () => onClick(type);

	return (
		<ButtonWrapper >
			<Button
				id={props.id}
				className={className}
				label={label}
				Icon={VIEWER_PANELS_ICONS[type]}
				placement="right"
				active={Boolean(active)}
				action={handleClick}
				disabled={disabled}
			/>
		</ButtonWrapper>
	);
};
