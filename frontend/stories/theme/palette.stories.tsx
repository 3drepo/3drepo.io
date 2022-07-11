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
import { GroupIcon } from '@/v5/ui/routes/viewer/groups/groupItem/groupItem.styles';
import { theme } from '@/v5/ui/themes/theme';
import { ComponentMeta, ComponentStory } from '@storybook/react';

const PaletteColourSample = ({ name, color }) => (
	<h5>
		<GroupIcon $color={color} $variant="dark" /> {color} -  {name}
	</h5>
);

const PaletteSample = ({ palette, name }) => (
	<div style={{ margin: 20 }}>
		<h1>{name}</h1>{
			Object.keys(palette).map((itemName) => (<PaletteColourSample name={itemName} color={palette[itemName]} />))
		}
		<hr />
	</div>
);

const NOT_COLORS = ['shadows',
	'mode',
	'gradient',
	'contrastThreshold',
	'getContrastText',
	'augmentColor',
	'tonalOffset'];

const ThemePalette = () => (
	<div style={{ padding: '50px' }}>
		{
			Object.keys(theme.palette)
				.filter((paletteItem) => !NOT_COLORS.includes(paletteItem))
				.map((paletteItem) => (<PaletteSample palette={theme.palette[paletteItem]} name={paletteItem} />))
		}
	</div>
);

export default {
	title: 'Theme/Palette',
	component: ThemePalette,
	parameters: {
		// More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
		layout: 'fullscreen',
	},
} as ComponentMeta<typeof ThemePalette>;

const Template: ComponentStory<typeof ThemePalette> = () => <ThemePalette />;

export const TypographySample = Template.bind({});
