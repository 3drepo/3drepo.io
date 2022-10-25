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
import { RiskLevelChip, RiskLevels } from '@controls/chip';
import { ChipList } from '@/v5/ui/routes/viewer/tickets/ticketsList/ticketItem/ticketItem.styles';

export default {
	title: 'Ticket Chips/RiskLevelChip',
	component: RiskLevelChip,
	argTypes: {
		state: {
			description: 'The risk level',
			options: RiskLevels,
			control: { type: 'select' },
			defaultValue: RiskLevels.UNSET,
		},
	},
} as ComponentMeta<typeof RiskLevelChip>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const AllTemplate: ComponentStory<typeof RiskLevelChip> = () => (
	<ChipList>
		{
			Object.keys(RiskLevels).map((key) => <RiskLevelChip state={RiskLevels[key]} />)
		}
	</ChipList>
);
const SingleTemplate: ComponentStory<typeof RiskLevelChip> = (args) => (
	<ChipList>
		<RiskLevelChip {...args} />
	</ChipList>
);

export const All = AllTemplate.bind({});
export const Single = SingleTemplate.bind({});
