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

import LightningIcon from '@assets/icons/filled/lightning-filled.svg';
import { Container, Background, GroupIcon } from './groupIcon.styles';
import { isLight } from '@/v5/helpers/colors.helper';

const isSmart = (rules) => (rules || []).length > 0;

export const GroupIconComponent = ({ rules, color }) => (
	<Container>
		<Background />
		<GroupIcon $color={color} $variant={isLight(color) ? 'light' : 'dark'}>
			{isSmart(rules) && <LightningIcon /> }
		</GroupIcon>
	</Container>
);
