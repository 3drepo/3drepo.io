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
/* eslint-disable max-len */

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { theme } from '@/v5/ui/themes/theme';
import { TypographyContainer, TypographySampleContainer, TypographySampleText } from './typography.styles';
import { capitalise, paletteVariants } from './helper';

const TypographySample = ({ name, typography, variant }) => (
	<TypographySampleContainer typography={typography} variant={variant}>
		{capitalise(name)} - {Object.keys(typography).map((field) => `${field}: ${typography[field]}`).join(', ')}
		<TypographySampleText variant={variant}> The quick brown fox jumps over the lazy dog</TypographySampleText>
	</TypographySampleContainer>
);

const NOT_TYPOGRAPHY = ['fontFamily', 'htmlFontSize', 'pxToRem', 'fontSize', 'fontWeightLight', 'fontWeightRegular', 'fontWeightMedium'];

const TypographyComponent = ({ variant }) => (
	<TypographyContainer>
		{
			Object.keys(theme.typography)
				.filter((key) => !NOT_TYPOGRAPHY.includes(key))
				.map((key) => (<TypographySample variant={variant} typography={theme.typography[key]} name={key} />))
		}
	</TypographyContainer>
);

export default {
	title: 'Theme/Typography',
	component: TypographyComponent,
	parameters: {
		// More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
		layout: 'fullscreen',
	},
	argTypes: {
		variant: {
			description: 'Color',
			options: paletteVariants(),
			control: { type: 'select' },
		},
	},
} as ComponentMeta<typeof TypographyComponent>;

const Template: ComponentStory<typeof TypographyComponent> = (args) => <TypographyComponent {...args} />;

export const Typography = Template.bind({});
Typography.args = {
	variant: 'main',
};
