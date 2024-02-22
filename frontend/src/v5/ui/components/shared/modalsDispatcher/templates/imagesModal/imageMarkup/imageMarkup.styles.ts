/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { formatMessage } from '@/v5/services/intl';
import styled from 'styled-components';

export const Image = styled.img.attrs({
	alt: formatMessage({ id: 'modal.markup.image', defaultMessage: 'Enlarged image' }),
})`
	max-width: 100%;
	max-height: 100%;
	box-sizing: border-box;
	border: solid 1px ${({ theme }) => theme.palette.base.light};
	border-radius: 10px;
`;

export const ImageContainer = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	height: calc(100vh - 210px);
	width: 100%;
`;

export const Container = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

export const MarkupToolbarContainer = styled.div`
	margin: auto;
`;
