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
import { TicketImage } from '@/v5/ui/routes/viewer/tickets/ticketsForm/properties/basicTicketImage/ticketImage/ticketImage.component';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { MockStoreProvider } from './MockStoreProvider';

export default {
	title: 'Inputs/Image/TicketImage',
	component: TicketImage,
} as ComponentMeta<typeof TicketImage>;

const Template: ComponentStory<typeof TicketImage> = () => (<TicketImage title="Ticket Image" />);

export const Default = Template.bind({});
Default.decorators = [(TicketImageComponent) => (
	<MockStoreProvider>
		<TicketImageComponent />
	</MockStoreProvider>
)];

export const NotAdmin = Template.bind({});
NotAdmin.decorators = [(TicketImageComponent) => (
	<MockStoreProvider isAdmin={false}>
		<TicketImageComponent />
	</MockStoreProvider>
)];
