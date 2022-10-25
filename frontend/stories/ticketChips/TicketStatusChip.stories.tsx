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
import { TicketStatusChip, TicketStatuses } from '@controls/chip';
import { ChipList } from '@/v5/ui/routes/viewer/tickets/ticketsList/ticketItem/ticketItem.styles';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
	title: 'Ticket Chips/TicketStatusChip',
	component: TicketStatusChip,
	// More on argTypes: https://storybook.js.org/docs/react/api/argtypes
	argTypes: {
		state: {
			description: 'The ticket status',
			options: TicketStatuses,
			control: { type: 'select' },
			defaultValue: TicketStatuses.OPEN,
		},
		variant: {
			options: ['outlined', 'text'],
			description: 'The chip variant',
			control: { type: 'select' },
		},
	},
} as ComponentMeta<typeof TicketStatusChip>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const AllTemplate: ComponentStory<typeof TicketStatusChip> = () => (
	<ChipList>
		{
			Object.keys(TicketStatuses).map((key) => <TicketStatusChip state={TicketStatuses[key]} />)
		}
	</ChipList>
);
const SingleTemplate: ComponentStory<typeof TicketStatusChip> = (args) => (
	<ChipList>
		<TicketStatusChip {...args} />
	</ChipList>
);

export const All = AllTemplate.bind({});

export const SingleOutlined = SingleTemplate.bind({});
SingleOutlined.args = {
	variant: 'outlined',
};
export const SingleText = SingleTemplate.bind({});
SingleText.args = {
	variant: 'text',
};
