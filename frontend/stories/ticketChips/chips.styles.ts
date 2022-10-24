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

import { ChipList } from '@/v5/ui/routes/viewer/tickets/ticketsList/ticketItem/ticketItem.styles';
import styled from 'styled-components';
import v5ViewerOverrides from '@/v5/ui/v4Adapter/overrides/cards/tickets.overrides';

export const ChipStyleWrapper = styled(ChipList)`
	${v5ViewerOverrides}
	>div {
		gap: 5px;
	}
`;
