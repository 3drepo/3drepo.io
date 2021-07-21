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

import { Tooltip } from '@material-ui/core';
import React from 'react';
import { DEFAULT_VIEWPOINTS } from './presetViews.constants';
import { StyledSvgIcon } from './presetViews.styles';

interface IProps {
	showPreset: (preset) => void;
}

export const PresetViews = ({ showPreset }: IProps) => {

	const handleViewpointClick = (preset) => () => showPreset(preset);

	return (
			<>
				{DEFAULT_VIEWPOINTS.map(({ icon, viewBox, _id, name, preset }) => (
					<Tooltip title={name} key={`${_id}_tooltip`}>
						<StyledSvgIcon viewBox={viewBox} onClick={handleViewpointClick(preset)} key={_id}>
							{icon()}
						</StyledSvgIcon>
					</Tooltip>
				))}
			</>
	);
};
