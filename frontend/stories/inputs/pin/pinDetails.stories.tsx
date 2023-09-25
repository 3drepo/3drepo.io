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
import { PinDetails } from '@components/viewer/cards/tickets/pinDetails/pinDetails.component';

export default {
	title: 'Inputs/PinDetails',
	component: PinDetails,
	parameters: { controls: { exclude: ['onChange', 'onBlur'] } },
} as Meta<typeof PinDetails>;

type Story = StoryObj<typeof PinDetails>;

export const Default: Story = { args: { pin: false } };
