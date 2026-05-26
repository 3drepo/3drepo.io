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

import { StoryObj, Meta } from '@storybook/react';
import { CentredContainer } from '@controls/centredContainer/centredContainer.component';
import styled from 'styled-components';
import { GRADIENT } from '@/v5/ui/themes/theme';

const ParentComponent = styled.div`
	height: 300px;
	width: 100%;
	border: 2px solid hotpink;
	background: ${GRADIENT.SECONDARY};
`;

const TextContainer = styled.div`
	padding: 20px;
	border-radius: 5px;
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	color: ${({ theme }) => theme.palette.secondary.main};
	${({ theme }) => theme.typography.h3}
`;

export default {
	title: 'Containers/CentredContainer',
	component: CentredContainer,
	argTypes: {
		vertical: {
			description: 'If true, the container will be centred vertically',
			type: 'boolean',
		},
		horizontal: {
			description: 'If true, the container will be centred horizontally',
			type: 'boolean',
		},
		children: {
			description: 'The text, button, or component to contain inside the container',
			defaultValue: 'Centred container\'s content',
		},
	},
	decorators: [
		(Story) => (
			<ParentComponent>
				<Story />
			</ParentComponent>
		),
	],
	render: ({ children, ...args }) => (
		<CentredContainer {...args}>
			<TextContainer>{children}</TextContainer>
		</CentredContainer>
	),
} as Meta<typeof CentredContainer>;

type Story = StoryObj<typeof CentredContainer>;

export const VerticalCentre: Story = {
	args: {
		vertical: true,
		horizontal: false,
		children: 'This is an example of a vertically centred container',
	},
};

export const HorizontalCentre: Story = {
	args: {
		vertical: false,
		horizontal: true,
		children: 'This is an example of a horizontally centred container',
	},
};

export const AllCentre: Story = {
	args: {
		vertical: true,
		horizontal: true,
		children: 'This is an example of a vertically and horizontally centred container',
	},
};

export const NoCentre: Story = {
	args: {
		vertical: false,
		horizontal: false,
		children: 'This is an example of no centering. Why would you want this? Do not use this.',
	},
};
