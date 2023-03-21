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

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { CentredContainer, ICentredContainer } from '@controls/centredContainer/centredContainer.component';
import styled, { css } from 'styled-components';

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
		parentHeight: {
			description: 'Height of the component that surrounds the centred container',
			defaultValue: '300px',
			type: 'string',
		},
		parentWidth: {
			description: 'Width of the component that surrounds the centred container',
			defaultValue: '100%',
			type: 'string',
		},
		children: {
			description: 'The text, button, or component to contain inside the container',
			defaultValue: 'Centred container\'s content',
		},
	},
	parameters: { controls: { exclude: ['className'] } },
} as ComponentMeta<typeof CentredContainer>;

const ParentComponent = styled.div<{ parentHeight: string, parentWidth: string }>`
	${({ parentHeight, parentWidth }) => css`
		height: ${parentHeight || '300px'};
		width: ${parentWidth || '100%'};
	`}
	border: 2px solid hotpink;
	background: ${({ theme }) => theme.palette.gradient.secondary};
`;

type ICentredContainerStory = ICentredContainer & {
	parentHeight: string;
	parentWidth: string;
};

const TextContainer = styled.div`
	padding: 20px;
	border-radius: 5px;
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	color: ${({ theme }) => theme.palette.secondary.main};
	${({ theme }) => theme.typography.h3}
`;

const Template: ComponentStory<typeof CentredContainer> = ({
	children,
	parentHeight,
	parentWidth,
	...args
}: ICentredContainerStory) => (
	<ParentComponent parentHeight={parentHeight} parentWidth={parentWidth}>
		<CentredContainer {...args}>
			<TextContainer>{children}</TextContainer>
		</CentredContainer>
	</ParentComponent>
);

export const VerticalCentre = Template.bind({});
VerticalCentre.args = {
	vertical: true,
	horizontal: false,
	children: 'This is an example of a vertically centred container',
};

export const HorizontalCentre = Template.bind({});
HorizontalCentre.args = {
	vertical: false,
	horizontal: true,
	children: 'This is an example of a horizontally centred container',
};

export const AllCentre = Template.bind({});
AllCentre.args = {
	vertical: true,
	horizontal: true,
	children: 'This is an example of a vertically and horizontally centred container',
};

export const NoCentre = Template.bind({});
NoCentre.args = {
	vertical: false,
	horizontal: false,
	children: 'This is an example of no centering. Why would you want this? Do not use this.',
};
