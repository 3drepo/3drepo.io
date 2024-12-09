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
import styled from 'styled-components';

const getStrokeColor = (colorHEX: string) => colorHEX.slice(-6);

export const Container = styled.div<{
	$borderRadius?: number;
	$strokeColor?: string;
	$strokeWidth?: number;
	$dashSize?: number;
	$gapSize?: number;
	$zeroPadding?: boolean;
}>`
	${({ theme, $borderRadius = 8, $strokeColor, $strokeWidth = 3, $dashSize = 5, $gapSize = 5, $zeroPadding }) => `
		background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='${$borderRadius}' ry='${$borderRadius}' stroke='%23${getStrokeColor($strokeColor ?? theme.palette.base.lightest)}FF' stroke-width='${$strokeWidth}' stroke-dasharray='${$dashSize}%2c${$gapSize}' stroke-linecap='butt'/%3e%3c/svg%3e");
		border-radius: ${$borderRadius}px;
		background-color: ${theme.palette.primary.contrast};
		padding: ${$zeroPadding ? 0 : $strokeWidth / 2}px;
		overflow: hidden;
	`}
`;
