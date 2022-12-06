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
import { FilterChip } from '@controls/chip';
import { ChipList } from '@/v5/ui/routes/viewer/tickets/ticketsList/ticketItem/ticketItem.styles';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
	title: 'Ticket Chips/FilterChip',
	component: FilterChip,
	// More on argTypes: https://storybook.js.org/docs/react/api/argtypes
	argTypes: {
		label: {
			description: 'The text that appears in the chip',
			control: { type: 'text' },
			defaultValue: 'Filter',
		},
		selected: {
			description: 'If the chip has been clicked on and is selected',
			type: 'boolean',
			defaultValue: false,
		},
		disabled: {
			description: 'If the chip has been disabled',
			type: 'boolean',
			defaultValue: false,
		},
	},
	parameters: { controls: { exclude: ['color'] } },
} as ComponentMeta<typeof FilterChip>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args

const Template: ComponentStory<typeof FilterChip> = (args) => (
	<ChipList>
		<FilterChip {...args} />
	</ChipList>
);

export const Unselected = Template.bind({});
Unselected.args = {
	label: 'Unselected',
};
export const Selected = Template.bind({});
Selected.args = {
	label: 'Selected',
	selected: true,
};
export const Disabled = Template.bind({});
Disabled.args = {
	label: 'Disabled',
	disabled: true,
};
