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
import styled, { css } from 'styled-components';

const IconBoxContainer = styled.div<{ $size: number }>`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: baseline;
    word-break: break-word;
	${({ $size }) => css`
		padding: ${$size * 2}px;
		min-height: ${$size * 11}px;
		max-width: ${$size * 10}px;
	`}

	& > svg,
	& > img {
		${({ $size }) => css`
			width: ${$size * 10}px;
			min-height: ${$size * 10}px;
			max-height: ${$size * 10}px;
		`}
	}

	& > span {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		font-weight: 500;
		color: #000;
		${({ $size }) => css`
			font-size: ${$size * 1.5}px;
		`}
	}
`;

const IconBox = ({ Icon, name, $size }) => (
	<IconBoxContainer $size={$size}>
		<Icon style={{ width: '20px' }} />
		<span>{name}</span>
	</IconBoxContainer>
);

const TemplateContainer = styled.div`
	display: flex;
	flex-direction: row;
	flex-flow: wrap;
	align-items: baseline;
    justify-content: space-evenly;
    max-height: 100vh;
    overflow-y: scroll;
`;

export type IconsTemplateProps = {
	backgroundColor: string,
	color?: string,
	icons: any[],
	iconSize: number,
};

export const IconsTemplate = ({ backgroundColor = '#6d9ded', color, icons, iconSize }: IconsTemplateProps) => (
	<TemplateContainer style={{ backgroundColor, color }}>
		{icons.map((icon) => <IconBox {...icon} $size={iconSize} key={icon.name} />)}
	</TemplateContainer>
);
