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
import { ImageWithSkeleton } from '@controls/imageWithSkeleton/imageWithSkeleton.component';
import styled from 'styled-components';

export default {
	title: 'Outputs/ImageWithSkeleton',
	component: ImageWithSkeleton,
	argTypes: {
		variant: {
			description: 'Variant of the skeleton',
			options: ['primary', 'secondary'],
			control: { type: 'select' },
		},
	},
	parameters: { controls: { exclude: ['className', 'onClick', 'src'] } },
} as ComponentMeta<typeof ImageWithSkeleton>;

const Container = styled.div<{ $variant?: 'primary'|'secondary' }>`
	height: 200px;
	width: 200px;
	padding: 20px;
	padding-right: calc(100% - 220px);
	background-color: ${({ $variant, theme: { palette } }) => (
		$variant === 'secondary' ? palette.secondary.main : palette.primary.contrast
	)};
`;

const Template: ComponentStory<typeof ImageWithSkeleton> = ({ variant, ...args }) => (
	<Container $variant={variant}>
		<ImageWithSkeleton variant={variant} {...args} src="WRONG_URL_TO_FORCE_ENDLESS_LOADING_STATUS" />
	</Container>
);

export const PrimarySkeleton = Template.bind({});
PrimarySkeleton.args = {
	variant: 'primary',
};

export const SecondarySkeleton = Template.bind({});
SecondarySkeleton.args = {
	variant: 'secondary',
};
