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
import { HoverPopover } from '@controls/hoverPopover/hoverPopover.component';
import { Meta, StoryObj } from '@storybook/react';
import { PopoverCircle } from '@components/shared/popoverCircles/popoverCircle.component';

export default {
	title: 'Info/PopoverCircle',
	component: PopoverCircle,
	parameters: { controls: { exclude: ['PopoverComponent'] } },
} as Meta<typeof PopoverCircle>;

type Story = StoryObj<typeof PopoverCircle>;

export const PopoverCircleWithImage: Story = {
	args: {
		src: 'https://i.pinimg.com/170x/26/5c/1c/265c1cc710304eb15607e18c6f591c85.jpg',
		PopoverComponent: () => <div>I am a popover</div>,
	},
	render: (args) => (
		<HoverPopover anchor={() => (<PopoverCircle {...args} />)}>
			<div>I am a popover</div>
		</HoverPopover>
	),
};
