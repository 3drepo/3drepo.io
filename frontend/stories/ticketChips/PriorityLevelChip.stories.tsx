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
import { PriorityLevelChip, PriorityLevels } from '@controls/chip';
import { ChipStyleWrapper } from './chips.styles';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
	title: 'Ticket Chips/PriorityLevelChip',
	component: PriorityLevelChip,
	// More on argTypes: https://storybook.js.org/docs/react/api/argtypes
	argTypes: {
		state: {
			description: 'The priority level',
			options: PriorityLevels,
			control: { type: 'select' },
			defaultValue: PriorityLevels.NONE,
		},
	},
} as ComponentMeta<typeof PriorityLevelChip>;

const V5ViewerChip = (props) => (
	<div id="tickets">
		<PriorityLevelChip {...props} />
	</div>
);
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const AllTemplate: ComponentStory<typeof PriorityLevelChip> = () => (
	<ChipStyleWrapper>
		{
			Object.keys(PriorityLevels).map((key) => <V5ViewerChip state={PriorityLevels[key]} />)
		}
	</ChipStyleWrapper>
);
const SingleTemplate: ComponentStory<typeof PriorityLevelChip> = (args) => (
	<ChipStyleWrapper>
		<V5ViewerChip {...args} />
	</ChipStyleWrapper>
);

export const All = AllTemplate.bind({});

export const Single = SingleTemplate.bind({});
