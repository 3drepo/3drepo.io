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
import { TicketFilter } from "@components/viewer/cards/cardFilters/cardFilters.types";
import { deserializeFilter, serializeFilter, splitByNonEscaped } from "@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFilters.helpers";

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
            }
        ]
    }

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
        it('should work for property of type manyOf', async () => {
            const filter:TicketFilter = {
                type:'manyOf',
                property: 'Colours',
                filter: {
                    operator: 'is',
                    values: ['black', 'green', 'red'],
                }
            }

            console.log(template); 
            const serialized = serializeFilter(template, filter);
            expect(filter).toEqual(deserializeFilter(template, serialized));
        });
    })


});
