/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import styled from 'styled-components';
import { Button as ButtonComponent } from '@controls/button';

export const Container = styled.div`
	min-width: 80px;
`;

export const Button = styled(ButtonComponent).attrs({
	variant: 'label',
	color: 'secondary',
})`
	margin: 0;
	width: 100%;
	color: ${({ theme, $isVoid }) => ($isVoid ? theme.palette.error.main : theme.palette.primary.main)};
`;
