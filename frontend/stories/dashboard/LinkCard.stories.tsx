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

import { Meta, StoryObj } from '@storybook/react';
import { LinkCard } from '@components/shared/linkCard/linkCard.component';
import { COLOR } from '@/v5/ui/themes/theme';
import { Button } from '@controls/button';
import { BrowserRouterDecorator } from '../decorators';

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
	decorators: [
		BrowserRouterDecorator,
		(Story, { args: { variant } }) => (
			<div style={{ height: 500, width: '100%', backgroundColor: variant === 'primary' ? COLOR.PRIMARY_MAIN_CONTRAST : COLOR.SECONDARY_MAIN }}>
				<Story />
			</div>
		),
	],
	parameters: { controls: { exclude: ['to', 'className', 'children'] } },
} as Meta<typeof LinkCard>;

type Story = StoryObj<typeof LinkCard>;

export const PrimaryWithHeadingAndSubheading: Story = {
	args: {
		variant: 'primary',
		heading: 'I am a heading',
		subheading: 'I am a subheading',
		imgSrc: 'https://cdn.photographycourse.net/wp-content/uploads/2014/11/Landscape-Photography-steps.jpg',
	},
};

export const PrimaryWithDefaultImage: Story = {
	args: {
		variant: 'primary',
		heading: 'This image defaults to defaultImgSrc',
		subheading: 'This is useful if the image is a response from an API request which could fail',
		imgSrc: 'this img will error',
		defaultImgSrc: 'https://learn.microsoft.com/en-us/windows/win32/uxguide/images/mess-error-image15.png',
	},
};

export const SecondaryWithChild: Story = {
	args: {
		variant: 'secondary',
		heading: 'I am a heading looooooooooooooong enough to wrap and use ellipsis',
		imgSrc: 'https://cdn.photographycourse.net/wp-content/uploads/2014/11/Landscape-Photography-steps.jpg',
		children: (
			<div style={{ textAlign: 'center' }}>
				<Button variant="contained">
					I am a child element
				</Button>
			</div>
		),
	},
};
