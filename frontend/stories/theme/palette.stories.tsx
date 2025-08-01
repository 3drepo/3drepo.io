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
import { palette } from '@/v5/ui/themes/theme';
import { Meta, StoryObj } from '@storybook/react';
import { paletteVariants } from './helper';
import { ColorPreview, PaletteColorSampleContainer, PaletteSampleContainer, PaletteName, PaletteContainer } from './palette.styles';

const PaletteColorSample = ({ name, hexValue }) => (
	<PaletteColorSampleContainer>
		<ColorPreview $color={hexValue} $variant="dark" /> &nbsp; {name} - {hexValue}
	</PaletteColorSampleContainer>
);

const PaletteSample = ({ item }) => (
	<PaletteSampleContainer>
		<PaletteName>{item}</PaletteName>
		{Object.entries(palette[item]).map(([name, hexValue]) => (<PaletteColorSample name={name} hexValue={hexValue} />))}
		<hr />
	</PaletteSampleContainer>
);

const ThemePalette = () => (
	<PaletteContainer>
		{paletteVariants().map((item) => (<PaletteSample item={item} />))}
	</PaletteContainer>
);

const meta: Meta<typeof ThemePalette> = {
	title: 'Theme/Palette',
	parameters: { layout: 'fullscreen' },
	component: ThemePalette,
};
export default meta;

type Story = StoryObj<typeof ThemePalette>;
export const Palette: Story = {};
