/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { ITemplate } from "@/v5/store/tickets/tickets.types";
import { getFullnameFromUser } from "@/v5/store/users/users.helpers";
import { TicketFilter } from "@components/viewer/cards/cardFilters/cardFilters.types";
import { deserializeFilter, serializeFilter, splitByNonEscaped } from "@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFilters.helpers";
import { userWithoutAvatarMockFactory } from "../users/users.fixtures";
import { pick, times } from 'lodash';
import { mockRiskCategories } from "./tickets.fixture";

describe('Tickets: filters', () => {
    const template: ITemplate = {
        _id: 'test-template',
        name: 'Test template',
        code: 'TTT',
        properties: [
            {
                name:'Colours',
                type:'manyOf',
                values: [
                    'black',
                    'silver',
                    'gray',
                    'white',
                    'maroon',
                    'red',
                    'purple',
                    'fuchsia',
                    'green',
                    'lime',
                    'olive',
                    'yellow',
                    'navy',
                    'blue',
                    'teal',
                    'aqua'
                ]
            },
            {
                name:'Assignees',
                type:'manyOf',
                values: 'jobsAndUsers'
            },
            {
                name: 'Risky risks',
                type: 'oneOf',
                values: 'riskCategories'
            }
        ],
        modules: [
            {
                name:'Users module',
                properties: [
                    {
                        name:'Cool users',
                        type:'oneOf',
                        values: 'jobsAndUsers',
                    }
                ]
            }
        ]
    }

    const users = times(5, () => userWithoutAvatarMockFactory());
    const risks = mockRiskCategories();

    describe('helpers', () => {
        it('split by non escaped characters should work', () => {
            let str = 'b\\,lack,sil\\ver,gray';
            let arr = splitByNonEscaped(str, ',');
            expect(arr).toEqual(['b\\,lack','sil\\ver','gray']);

            str = 'aqua';
            arr = splitByNonEscaped(str, ',');
            expect(arr).toEqual(['aqua']);

            str = 'violet,';
            arr = splitByNonEscaped(str, ',');
            expect(arr).toEqual(['violet','']);

            str = ',green';
            arr = splitByNonEscaped(str, ',');
            expect(arr).toEqual(['','green']);

            str = '\\,li\\,me\\,';
            arr = splitByNonEscaped(str, ',');
            expect(arr).toEqual([str]);

        });
    });

    describe('serialization', () => {
        // Containers
        it('should work for property of type manyOf', () => {
            const filter:TicketFilter = {
                type:'manyOf',
                property: 'Colours',
                filter: {
                    operator: 'is',
                    values: ['black', 'green', 'red'],
                }
            }

            const serialized = serializeFilter(template, risks, filter);
            expect(filter).toEqual(deserializeFilter(template, users, risks, serialized));
        });

        it('should work for general jobsAndUsers', () => {
            const filter:TicketFilter = {
                type:'manyOf',
                property: 'Assignees',
                filter: {
                    operator: 'eq',
                    values: [users[2].user, 'Techinician', users[1].user],
                    displayValues: [getFullnameFromUser(users[2]), 'Techinician', getFullnameFromUser(users[1])].join(',')
                }
            }

            const serialized = serializeFilter(template, risks, filter);
            expect(filter).toEqual(deserializeFilter(template, users, risks, serialized));
        });

        it('should work for jobsAndUsers in a module', () => {
            const filter:TicketFilter = {
                type:'oneOf',
                property: 'Cool users',
                module: 'Users module',
                filter: {
                    operator: 'eq',
                    values: ['Electrician', users[4].user, users[2].user],
                    displayValues: ['Electrician', getFullnameFromUser(users[4]), getFullnameFromUser(users[2])].join(',')
                }
            }

            const serialized = serializeFilter(template, risks, filter);
            expect(filter).toEqual(deserializeFilter(template, users, risks, serialized));
        });

        it('should work for type owner', () => {
            const filter:TicketFilter = {
                type:'owner',
                property: 'Owner',
                filter: {
                    operator: 'eq',
                    values: [users[0].user, 'Architect', users[3].user],
                    displayValues: [getFullnameFromUser(users[0]), 'Architect', getFullnameFromUser(users[3])].join(',')
                }
            }

            const serialized = serializeFilter(template, risks, filter);
            expect(filter).toEqual(deserializeFilter(template, users, risks, serialized));
        });

        it('should work for type risks', () => {
            const filter:TicketFilter = {
                type: 'oneOf',
                property: 'Risky risks',
                filter: {
                    operator: 'eq',
                    values: [risks[1], risks[3], risks[2]],
                }
            }

            const serialized = serializeFilter(template, risks, filter);            
            expect(filter).toEqual(deserializeFilter(template, users, risks, serialized));
        });

        it('should work with createad at type', () => {
            const filter:TicketFilter = {
                property: 'Created at',
                type: 'createdAt',
                filter: {
                    operator: 'lte',
                    values: [1759273259999],
                    displayValues: '01/10/2025'
                }
            };

            const serialized = serializeFilter(template, risks, filter);
            console.log(serialized);
            
            expect(filter).toEqual(deserializeFilter(template, users, risks, serialized));
        });
    })

});
