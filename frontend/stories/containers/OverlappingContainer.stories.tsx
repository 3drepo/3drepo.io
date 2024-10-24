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

import { Meta, StoryObj } from '@storybook/react';
import { OverlappingContainer } from '@controls/overlappingContainer/overlappingContainer.styles';
import styled from 'styled-components';
import { hexToOpacity } from '@/v5/helpers/colors.helper';

const OverlappingContainerWithSize = styled(OverlappingContainer)`
	width: 400px;
	height: 200px;
	margin: 100px auto;
`;

export default {
	title: 'Containers/OverlappingContainer',
	component: OverlappingContainer,
	argTypes: {
		text: {
			description: 'example of combination with text',
		},
	},
	parameters: { controls: { exclude: ['className', 'children'] } },
	render: ({ children }) => (
		<OverlappingContainerWithSize>
			<img src="https://cdn.photographycourse.net/wp-content/uploads/2014/11/Landscape-Photography-steps.jpg" />
			{children}
		</OverlappingContainerWithSize>
	),
} as Meta<typeof OverlappingContainer>;

const FrontText = styled.div`
	background-color: ${({ theme }) => hexToOpacity(theme.palette.secondary.main, 60)};
	display: flex;
	justify-content: center;
	align-items: center;
	${({ theme }) => theme.typography.h5}
`;

const FrontTextOnHover = styled(FrontText)`
	opacity: 0;

	&:hover {
		opacity: 1;
	}
`;

type Story = StoryObj<typeof OverlappingContainer>;

export const FixedText: Story = {
	args: {
		children: <FrontText>Always on text</FrontText>,
	},
};

export const OnHoverText: Story = {
	args: {
		children: <FrontTextOnHover>I display on hover</FrontTextOnHover>,
	},
};
