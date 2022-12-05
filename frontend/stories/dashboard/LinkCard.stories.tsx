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
import { LinkCard } from '@components/shared/linkCard/linkCard.component';
import { BrowserRouter } from 'react-router-dom';
import { COLOR } from '@/v5/ui/themes/theme';

export default {
	title: 'Dashboard/LinkCard',
	component: LinkCard,
	argTypes: {
		heading: {
			type: 'string',
		},
		subheading: {
			type: 'string',
		},
		variant: {
			options: ['primary', 'secondary'],
		},
	},
	parameters: { controls: { exclude: ['to', 'className', 'children'] } },
} as ComponentMeta<typeof LinkCard>;

const SecondaryTemplate: ComponentStory<typeof LinkCard> = (args) => (
	<BrowserRouter>
		<div style={{ height: 500, width: '100%', backgroundColor: COLOR.SECONDARY_MAIN }}>
			<LinkCard {...args} />
		</div>
	</BrowserRouter>
);

const PrimaryTemplate: ComponentStory<typeof LinkCard> = (args) => (
	<BrowserRouter>
		<div style={{ height: 500, width: '100%', backgroundColor: COLOR.PRIMARY_MAIN_CONTRAST }}>
			<LinkCard {...args} />
		</div>
	</BrowserRouter>
);

const ImgPlaceholder = (
	<img
		src="https://cdn.photographycourse.net/wp-content/uploads/2014/11/Landscape-Photography-steps.jpg"
		width="100%"
		alt="placeholder"
	/>
);

export const SecondaryWithEllipsisHeading = SecondaryTemplate.bind({});
SecondaryWithEllipsisHeading.args = {
	variant: 'secondary',
	heading: 'I am a heading looooooooooooooong enough to wrap and use ellipsis',
	children: ImgPlaceholder,
};

export const PrimaryWithHeadingAndSubheading = PrimaryTemplate.bind({});
PrimaryWithHeadingAndSubheading.args = {
	variant: 'primary',
	heading: 'I am a heading',
	subheading: 'I am a subheading',
	children: ImgPlaceholder,
};
