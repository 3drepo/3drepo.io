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

import { ComponentType } from 'react';
import { Tooltip } from '@mui/material';
import FrontViewIcon from '@assets/icons/twoToned/front_view-two_toned.svg';
import BackViewIcon from '@assets/icons/twoToned/back_view-two_toned.svg';
import LeftViewIcon from '@assets/icons/twoToned/left_view-two_toned.svg';
import RightViewIcon from '@assets/icons/twoToned/right_view-two_toned.svg';
import TopDownIcon from '@assets/icons/twoToned/top_down-two_toned.svg';
import BottomUpIcon from '@assets/icons/twoToned/bottom_up-two_toned.svg';
import { StyledPresetIcon } from './presetViews.styles';

interface IProps {
	showPreset: (preset: string) => void;
}

interface IPresetViewpoint {
	_id: string;
	name: string;
	preset: string;
	icon: ComponentType<{ className?: any }>;
}

export const PRESET_VIEW = {
	TOP: 'top',
	BOTTOM: 'bottom',
	FRONT: 'front',
	BACK: 'back',
	LEFT: 'left',
	RIGHT: 'right',
};

const DEFAULT_VIEWPOINTS: IPresetViewpoint[] = [
	{ _id: 'default_3', name: 'Front View', preset: PRESET_VIEW.FRONT, icon: FrontViewIcon },
	{ _id: 'default_4', name: 'Back View', preset: PRESET_VIEW.BACK, icon: BackViewIcon },
	{ _id: 'default_5', name: 'Side View (Left)', preset: PRESET_VIEW.LEFT, icon: LeftViewIcon },
	{ _id: 'default_6', name: 'Side View (Right)', preset: PRESET_VIEW.RIGHT, icon: RightViewIcon },
	{ _id: 'default_1', name: 'Top Down', preset: PRESET_VIEW.TOP, icon: TopDownIcon },
	{ _id: 'default_2', name: 'Bottom Up', preset: PRESET_VIEW.BOTTOM, icon: BottomUpIcon },
];

export const PresetViews = ({ showPreset }: IProps) => (
	<>
		{DEFAULT_VIEWPOINTS.map(({ icon: Icon, _id, name, preset }) => (
			<Tooltip title={name} key={`${_id}_tooltip`}>
				<StyledPresetIcon onClick={() => showPreset(preset)} key={_id}>
					<Icon />
				</StyledPresetIcon>
			</Tooltip>
		))}
	</>
);
