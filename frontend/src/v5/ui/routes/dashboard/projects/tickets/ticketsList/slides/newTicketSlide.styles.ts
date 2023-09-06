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

import { SubmitButton } from '@controls/submitButton';
import styled from 'styled-components';

export const SaveButton = styled(SubmitButton)`
	margin: 9px 15px;
	width: fit-content;
`;

export const ButtonContainer = styled.div`
	display: flex;
	justify-content: end;
	width: 100%;
`;

export const RequiresViewerContainer = styled.div`
	padding: 27px;
	box-sizing: border-box;
	width: 100%;
	height: 100%;
	display: flex;
	place-items: center;
	text-align: center;
	${({ theme }) => theme.typography.h5}
`;
