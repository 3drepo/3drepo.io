/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import Scrollbars from 'react-custom-scrollbars';
import styled from 'styled-components';
import { COLOR } from '@/v5/ui/themes/theme';
import { isV5 } from '@/v4/helpers/isV5';

const ThumbVertical = styled.div`
	background-color: ${COLOR.BASE_LIGHTEST};
	right: ${isV5() ? 3 : 2}px;
	bottom: 6px;
	top: 0px;
	border-radius: 3px;
	width: 6px;
	z-index: 10;
`;

const ThumbHorizontal = styled.div`
	display: none;
`;

export const ConditionalV5OrViewerScrollAreaBase = styled(Scrollbars).attrs({
	autoHideTimeout: 1000,
	autoHideDuration: 300,
	autoHide: true,
	renderThumbVertical: ({ style }) => <ThumbVertical style={style} />,
	renderThumbHorizontal: ({ style }) => <ThumbHorizontal style={style} />,
})`` as any;
