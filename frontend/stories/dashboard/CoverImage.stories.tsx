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
import { CoverImage } from '@controls/coverImage/coverImage.component';
import DefaultTeamspaceImg from '@assets/images/teamspace_placeholder.svg';

const meta: Meta<typeof CoverImage> = {
	title: 'Dashboard/CoverImage',
	component: CoverImage,
	argTypes: {
		imgSrc: {
			type: 'string',
		},
		defaultImgSrc: {
			type: 'string',
		},
	},
	parameters: { controls: { exclude: ['className'] } },
};
export default meta;

type Story = StoryObj<typeof CoverImage>;

const INVALID_TEAMSPACE_IMG_SRC = new Error();

export const CoverImageWithoutError: Story = {
	args: {
		imgSrc: 'https://i.pinimg.com/170x/26/5c/1c/265c1cc710304eb15607e18c6f591c85.jpg',
		defaultImgSrc: DefaultTeamspaceImg,
	},
};

export const TeamspaceCoverImageUsingDefaultImg: Story = {
	args: {
		// @ts-expect-error
		imgSrc: INVALID_TEAMSPACE_IMG_SRC,
		defaultImgSrc: DefaultTeamspaceImg,
	},
};
