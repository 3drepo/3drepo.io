/**
 *  Copyright (C) 2020 3D Repo Ltd
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
import {
	IconsGroup,
	StyledDeleteIcon,
	StyledEditIcon,
} from '../../viewerGui/components/views/components/viewItem/viewItem.styles';

import { StyledContainedButton } from '../modelSettings.styles';
import { ViewName, ViewRow } from './defaultViewField.styles';

interface IDefaultView {
	id: string;
	name: string;
}

interface IProps {
	onSelectView: (onChange) => () => void;
	value?: undefined | IDefaultView;
	onChange: (v) => void;
}

export const DefaultViewField = ({ onSelectView, value, onChange }: IProps) => {
	if (!value) {
		return (
			<StyledContainedButton onClick={onSelectView} variant="contained">
				Select View
			</StyledContainedButton>
		);
	}

	const onRemove = () => onChange({ target: { value: undefined, name: 'defaultView' }});

	return (
			<ViewRow>
				<ViewName variant="body1">{value.name}</ViewName>
				<IconsGroup>
					<StyledEditIcon onClick={onSelectView} />
					<StyledDeleteIcon onClick={onRemove} />
				</IconsGroup>
			</ViewRow>
	);
};
