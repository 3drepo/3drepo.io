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

import { SubmitButton } from '@controls/submitButton';
import { CircleButton } from '@controls/circleButton';
import styled from 'styled-components';

export const Form = styled.form`
	height: calc(100% - 49px);
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
`;

export const SaveButton = styled(SubmitButton)`
	margin: 9px 15px;
	width: fit-content;
`;

export const BottomArea = styled.div`
	box-shadow: 0 -6px 10px rgb(0 0 0 / 4%);
	z-index: 2;
	display: flex;
	justify-content: flex-end;
`;

export const CloseButton = styled(CircleButton).attrs({
	size: 'medium',
	variant: 'viewer',
})`
	margin-left: auto;
	&& > svg {
		height: 12px;
	}
`;
