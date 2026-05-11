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

import { Tooltip } from '@mui/material';
import FrontViewIcon from '@assets/icons/twoToned/front_view-two_toned.svg';
import BackViewIcon from '@assets/icons/twoToned/back_view-two_toned.svg';
import LeftViewIcon from '@assets/icons/twoToned/left_view-two_toned.svg';
import RightViewIcon from '@assets/icons/twoToned/right_view-two_toned.svg';
import TopDownIcon from '@assets/icons/twoToned/top_down-two_toned.svg';
import BottomUpIcon from '@assets/icons/twoToned/bottom_up-two_toned.svg';
import { PresetViewsContainer, StyledPresetIcon } from './presetViews.styles';
import { ViewpointsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { formatMessage } from '@/v5/services/intl';
import { IPresetViewpoint } from '@/v5/store/viewpoints/viewpoints.types';

export const PRESET_VIEW = {
	TOP: 'top',
	BOTTOM: 'bottom',
	FRONT: 'front',
	BACK: 'back',
	LEFT: 'left',
	RIGHT: 'right',
};

const DEFAULT_VIEWPOINTS: IPresetViewpoint[] = [
	{ _id: 'preset_1', name: formatMessage({ id: 'viewer.cards.views.frontView', defaultMessage: 'Front View' }), preset: PRESET_VIEW.FRONT, icon: FrontViewIcon },
	{ _id: 'preset_2', name: formatMessage({ id: 'viewer.cards.views.backView', defaultMessage: 'Back View' }), preset: PRESET_VIEW.BACK, icon: BackViewIcon },
	{ _id: 'preset_3', name: formatMessage({ id: 'viewer.cards.views.leftView', defaultMessage: 'Side View (Left)' }), preset: PRESET_VIEW.LEFT, icon: LeftViewIcon },
	{ _id: 'preset_4', name: formatMessage({ id: 'viewer.cards.views.rightView', defaultMessage: 'Side View (Right)' }), preset: PRESET_VIEW.RIGHT, icon: RightViewIcon },
	{ _id: 'preset_5', name: formatMessage({ id: 'viewer.cards.views.topDown', defaultMessage: 'Top Down' }), preset: PRESET_VIEW.TOP, icon: TopDownIcon },
	{ _id: 'preset_6', name: formatMessage({ id: 'viewer.cards.views.bottomUp', defaultMessage: 'Bottom Up' }), preset: PRESET_VIEW.BOTTOM, icon: BottomUpIcon },
];

export const PresetViews = () => (
	<PresetViewsContainer>
		{DEFAULT_VIEWPOINTS.map(({ icon: Icon, _id, name, preset }) => (
			<Tooltip  key={`${_id}_tooltip`} title={name}>
				<StyledPresetIcon key={_id} onClick={() => ViewpointsActionsDispatchers.showPreset(preset)}>
					<Icon />
				</StyledPresetIcon>
			</Tooltip>
		))}
	</PresetViewsContainer>
);
