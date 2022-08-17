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
import { ITeamspace, Quota } from "@/v5/store/teamspaces/teamspaces.redux";
import faker from "faker";

export const teamspaceMockFactory = (overrides?: Partial<ITeamspace>): ITeamspace => ({
    name: faker.random.word(),
	isAdmin: faker.datatype.boolean(),
    ...overrides
});

export const quotaMockFactory = (overrides: Partial<Quota> = {}): Quota => ({
	freeTier: faker.datatype.boolean(),
    expiryDate: faker.datatype.number(),
    data: {
        used:faker.datatype.number(),
        available: faker.datatype.number(),
    },
    seats: {
        used: faker.datatype.number(),
        available: faker.datatype.number()
    },
    ...overrides
});
