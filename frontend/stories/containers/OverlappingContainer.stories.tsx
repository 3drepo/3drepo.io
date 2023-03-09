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

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { OverlappingContainer } from '@controls/overlappingContainer/overlappingContainer.styles';
import styled from 'styled-components';
import { hexToOpacity } from '@/v5/ui/themes/theme';

export default {
	title: 'Containers/OverlappingContainer',
	component: OverlappingContainer,
	argTypes: {
		text: {
			description: 'example of combination with text',
			defaultValue: 'Example text',
		},
	},
	parameters: { controls: { exclude: ['className'] } },
} as ComponentMeta<typeof OverlappingContainer>;

const BackgroundImage = styled.img.attrs({
	src: 'https://cdn.photographycourse.net/wp-content/uploads/2014/11/Landscape-Photography-steps.jpg',
})``;

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

const OverlappingContainerWithSize = styled(OverlappingContainer)`
	width: 400px;
	height: 200px;
	margin: 100px auto;
`;

const FixedTextTemplate: ComponentStory<typeof OverlappingContainer> = ({ text }) => (
	<OverlappingContainerWithSize>
		<BackgroundImage />
		<FrontText>{text}</FrontText>
	</OverlappingContainerWithSize>
);

export const FixedText = FixedTextTemplate.bind({});
FixedText.args = { text: 'Always on text' };

const OnHoverTextTemplate: ComponentStory<typeof OverlappingContainer> = ({ text }) => (
	<OverlappingContainerWithSize>
		<BackgroundImage />
		<FrontTextOnHover>{text}</FrontTextOnHover>
	</OverlappingContainerWithSize>
);

export const OnHoverText = OnHoverTextTemplate.bind({});
OnHoverText.args = { text: 'I display on hover' };
