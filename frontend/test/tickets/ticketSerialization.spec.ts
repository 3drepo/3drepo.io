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
import { arrToDisplayValue, deserializeFilter, formatDateRange, InvalidPropertyError, serializeFilter, splitByNonEscaped, templatesToFilters, valueToDisplayDate } from "@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFilters.helpers";
import { mockRiskCategories, templateMockFactory } from "./tickets.fixture";
import { initializeIntl } from "@/v5/services/intl";
import { TicketsSortingPropertyDictionary } from "@/v5/store/tickets/card/ticketsCard.types";
import { deserializeSorting, serializeSorting } from "@/v5/helpers/ticketsSorting.helpers";
import { removeHiddenPropertiesFromTemplates } from "@/v5/store/tickets/ticketsTemplates.helpers";

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
			},
			{
				name: 'Birthday',
				type: 'pastDate',
			},
			{
				name: 'Expiration',
				type: 'date',
			},
			{
				name: 'long text',
				type: 'longText'
			}, 
			{
				name: 'Boolean property',
				type: 'boolean'
			},
			{
				name: 'A number property',
				type: 'number',
			},
			{
				name: 'Cool text',
				type: 'text'
			}, {
				name: 'Weird, options',
				type: 'manyOf',
				values: [
					'E.M.H.-stuff',
					'Another one',
					'Gray, John',
					'Ye:asda',
				]
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
			},
			{
				type: "sequencing",
				properties: [
					{
						name: 'Start Time',
						type: 'date'
					},
					{
						name: 'End Time',
						type: 'date'
					},
					{
						name: 'Sequence type',
						type: 'oneOf',
						values: [
							'Draft',
							'Normal',
							'Detailed'
						]
					}
				]
			}
		]
	}

	const users =   [
        {
                "user": "quantify",
                "firstName": "overriding",
                "lastName": "Credit",
                "company": "bypassing",
                "job": "Rustic",
                "email": "Wilma54@yahoo.com",
                "hasAvatar": false,
                "avatarUrl": ""
        },
        {
                "user": "Sleek",
                "firstName": "Account",
                "lastName": "infomediaries",
                "company": "Global",
                "job": "Computer",
                "email": "Rosa_Abernathy@hotmail.com",
                "hasAvatar": false,
                "avatarUrl": ""
        },
        {
                "user": "Optional",
                "firstName": "Supervisor",
                "lastName": "Chicken",
                "company": "Automated",
                "job": "front-end",
                "email": "Michaela_Hackett@gmail.com",
                "hasAvatar": false,
                "avatarUrl": ""
        },
        {
                "user": "PNG",
                "firstName": "hub",
                "lastName": "Refined",
                "company": "Beauty",
                "job": "Supervisor",
                "email": "Ray.Ziemann@gmail.com",
                "hasAvatar": false,
                "avatarUrl": ""
        },
        {
                "user": "convergence",
                "firstName": "copying",
                "lastName": "hacking",
                "company": "calculate",
                "job": "transmitting",
                "email": "Fern43@gmail.com",
                "hasAvatar": false,
                "avatarUrl": ""
        }
    ];

	const jobs = [
		{
			_id: 'Electrician',
			color: '#000000',
			isViewer: true,
		},
		{
			_id: 'Technician',
			color: '#161195',
		},
		{
			_id: 'Gardener',
			color: '#289c4d',
		},
	]

	const risks = mockRiskCategories();
	const jobsAndUsers = [...users, ...jobs];
	const templates = [template, templateMockFactory()];

	initializeIntl('en-GB');

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

		it('should not include hidden properties in available filters for sanitized templates', () => {
			const templateWithHiddenProperties = templateMockFactory({
				properties: [
					{ name: 'Visible property', type: 'text' },
					{ name: 'Hidden property', type: 'text', hiddenOnUI: true },
				],
				modules: [
					{
						name: 'Module',
						properties: [
							{ name: 'Visible module property', type: 'number' },
							{ name: 'Hidden module property', type: 'number', hiddenOnUI: true },
						],
					},
				],
			});

			const filters = templatesToFilters(removeHiddenPropertiesFromTemplates([templateWithHiddenProperties]));

			expect(filters).toEqual(expect.arrayContaining([
				expect.objectContaining({ property: 'Visible property' }),
				expect.objectContaining({ module: 'Module', property: 'Visible module property' }),
			]));
			expect(filters).not.toEqual(expect.arrayContaining([
				expect.objectContaining({ property: 'Hidden property' }),
				expect.objectContaining({ module: 'Module', property: 'Hidden module property' }),
			]));
		});
	});

	describe('filters serialization', () => {
		it('should work for property of type manyOf', () => {
			const filter:TicketFilter = {
				module: '',
				type:'manyOf',
				property: 'Colours',
				filter: {
					operator: 'is',
					values: ['black', 'green', 'red'],
					displayValues: 'black, green, red'
				}
			}

			const serialized = serializeFilter([template], filter, jobsAndUsers, risks);
			expect(filter).toEqual(deserializeFilter([template], serialized, jobsAndUsers, risks));
		});

		it('should work for general jobsAndUsers', () => {
			const filter: TicketFilter = {
				type:'manyOf',
				property: 'Assignees',
				module: '',
				filter: {
					operator: 'eq',
					values: [users[2].user, jobs[1]._id, users[1].user],
					displayValues: [getFullnameFromUser(users[2]), jobs[1]._id, getFullnameFromUser(users[1])].join(', ')
				}
			}

			const serialized = serializeFilter([template], filter, jobsAndUsers, risks);
			expect(deserializeFilter([template], serialized, jobsAndUsers, risks)).toEqual(filter);
		});

		it('should work for jobsAndUsers in a module', () => {
			const filter: TicketFilter = {
				type:'oneOf',
				property: 'Cool users',
				module: 'Users module',
				filter: {
					operator: 'eq',
					values: [jobs[0]._id, users[4].user, users[2].user],
					displayValues: [jobs[0]._id, getFullnameFromUser(users[4]), getFullnameFromUser(users[2])].join(', ')
				}
			}

			const serialized = serializeFilter([template], filter, jobsAndUsers, risks);
			expect(deserializeFilter([template], serialized, jobsAndUsers, risks)).toEqual(filter);
		});

		it('should work for type owner', () => {
			const filter: TicketFilter = {
				module: '',
				type:'owner',
				property: 'Owner',
				filter: {
					operator: 'eq',
					values: [users[0].user, users[3].user],
					displayValues: [getFullnameFromUser(users[0]), getFullnameFromUser(users[3])].join(', ')
				}
			}

			const serialized = serializeFilter([template], filter, jobsAndUsers, risks);
			expect(deserializeFilter([template], serialized, jobsAndUsers, risks)).toEqual(filter);
		});

		it('should work for type risks', () => {
			const filter: TicketFilter = {
				module: '',
				type: 'oneOf',
				property: 'Risky risks',
				filter: {
					operator: 'eq',
					values: [risks[1], risks[3], risks[2]],
					displayValues: `${risks[1]}, ${risks[3]}, ${risks[2]}`
				}
			}

			const serialized = serializeFilter([template], filter, jobsAndUsers, risks);            
			expect(deserializeFilter([template], serialized, jobsAndUsers, risks)).toEqual(filter);
		});

		it('should work with general date', () => {
			const filter: TicketFilter = {
				module: '',
				property: 'Expiration',
				type: 'date',
				filter: {
					operator: 'gte',
					values: [2004782460000],
					displayValues: valueToDisplayDate(2004782460000)
				}
			};

			const serialized = serializeFilter([template], filter, jobsAndUsers, risks);
			expect(deserializeFilter([template], serialized, jobsAndUsers, risks)).toEqual(filter);
		});
		it('should work with date and exists operator', () => {
			const filter: TicketFilter = {
				module: '',
				property: 'Birthday',
				type: 'pastDate',
				filter: {
					operator: 'ex',
					values: [],
				}
			};

			const serialized = serializeFilter([template], filter, jobsAndUsers, risks);
			expect(deserializeFilter([template], serialized, jobsAndUsers, risks)).toEqual(filter);
		});

		it('should work with past date', () => {
			const filter: TicketFilter = {
				module: '',
				property: 'Birthday',
				type: 'pastDate',
				filter: {
					operator: 'lte',
					values: [1735689600000],
					displayValues: valueToDisplayDate(1735689600000)
				}
			};

			const serialized = serializeFilter([template], filter, jobsAndUsers, risks);
			expect(deserializeFilter([template], serialized, jobsAndUsers, risks)).toEqual(filter);
		});

		it('should work with create at type', () => {
			const filter: TicketFilter = {
				module: '',
				property: 'Created at',
				type: 'createdAt',
				filter: {
					operator: 'lte',
					values: [1759273259999],
					displayValues: valueToDisplayDate(1759273259999)
				}
			};

			const serialized = serializeFilter([template], filter, jobsAndUsers, risks);
			expect(deserializeFilter([template], serialized, jobsAndUsers, risks)).toEqual(filter);
		});

		it('should work with range in type', () => {
			const filter: TicketFilter ={
				module: '',
				property:'Expiration',
				type:'date',
				filter:{
					'operator':'rng',
					values:[
						[1601553593000,1761782459999],
						[1767225600000,1774911719999]],
					displayValues: arrToDisplayValue([
						formatDateRange([1601553593000,1761782459999]),
						formatDateRange([1767225600000,1774911719999])
					])
				}
			};

			const serialized = serializeFilter([template], filter, jobsAndUsers, risks);
			expect(filter).toEqual(deserializeFilter([template], serialized, jobsAndUsers, risks));
		});

		it('should work with sequencing module', () => {
			let filter: TicketFilter = {
				module: 'sequencing',
				property: 'Start Time',
				type: 'date',
				filter: {
					operator:'rng',
					values:[[1759273200000,1760742059999]],
					displayValues: formatDateRange([1759273200000,1760742059999])
				}
			};
			
			let serialized = serializeFilter([template], filter, jobsAndUsers, risks);
			expect(deserializeFilter([template], serialized, jobsAndUsers, risks)).toEqual(filter);

			filter = {
				module: 'sequencing',
				property: 'End Time',
				type: 'date',
				filter: {
					operator:'gte',
					values: [1759532400000],
					displayValues: valueToDisplayDate(1759532400000)
				}
			};
			
			serialized = serializeFilter([template], filter, jobsAndUsers, risks);
			expect(deserializeFilter([template], serialized, jobsAndUsers, risks)).toEqual(filter);
		}); 

		it('should work with sequencing module options', () => {
			let filter: TicketFilter = {
				module: 'sequencing',
				property: 'Sequence type',
				type: 'oneOf',
					filter: {
						operator: 'is',
						values: [
							'Detailed',
							'Draft'
						],
						displayValues: 'Detailed, Draft'
					}
			};
			
			let serialized = serializeFilter([template], filter, jobsAndUsers, risks);
			expect(deserializeFilter([template], serialized, jobsAndUsers, risks)).toEqual(filter);
		});

		it('should work with boolean values', () => {
			let filter: TicketFilter ={
				module: '',
				property: 'Boolean property',
				type: 'boolean',
				filter:  {
					operator: 'eq',
					values: [true],
					displayValues: 'True'
				}
			}
			
			let serialized = serializeFilter([template], filter, jobsAndUsers, risks);
			expect(deserializeFilter([template], serialized, jobsAndUsers, risks)).toEqual(filter);

			filter = {
				module: '',
				property: 'Boolean property',
				type: 'boolean',
				filter:  {
					operator: 'eq',
					values: [false],
					displayValues: 'False'
				}
			}
			
			serialized = serializeFilter([template], filter, jobsAndUsers, risks);
			expect(deserializeFilter([template], serialized, jobsAndUsers, risks)).toEqual(filter);
		});

		it('should work with number values', () => {
			const filter: TicketFilter = {
				module: '',
				property: 'A number property',
				type: 'number',
				filter: {
					operator: 'eq',
					values: [1,3,98,2],
					displayValues: '1, 3, 98, 2'
				}
			};

			const serialized = serializeFilter([template], filter, jobsAndUsers, risks);
			expect(deserializeFilter([template], serialized, jobsAndUsers, risks)).toEqual(filter);
		});

		it('should work with tickecode values', () => {
			const filter: TicketFilter = {
				module: '',
				property: 'Ticket ID',
				type: 'ticketCode',
				filter:{
					operator: 'ss',
					values: ['10'],
					displayValues: '10'
				}
			};

			const serialized = serializeFilter([template], filter, jobsAndUsers, risks);
			expect(deserializeFilter([template], serialized, jobsAndUsers, risks)).toEqual(filter);
		});

		it('should work with title values', () => {
			const filter: TicketFilter = {
				module: '',
				property:"Ticket title",
				type:"title",
				filter:{"operator":"ss",
					values:["leo"],
					displayValues:"leo"
				}
			}
	
			const serialized = serializeFilter([template], filter, jobsAndUsers, risks);
			expect(deserializeFilter([template], serialized, jobsAndUsers, risks)).toEqual(filter);
		});

		it('should work with general text values', () => {
			const filter: TicketFilter = {
				module: '',
				property: 'long text',
				type: 'longText',
				filter: {
					operator: 'is',
					values: ['asdasd'],
					displayValues: 'asdasd'
				}
			};
	
			const serialized = serializeFilter([template], filter, jobsAndUsers, risks);
			expect(deserializeFilter([template], serialized, jobsAndUsers, risks)).toEqual(filter);
		});

		it('should support filters with "." and "," characters with text', () => {
			const filter: TicketFilter = {
				module: '',
				property: 'Cool text',
				type: 'text',
				filter: {
					operator: 'is',
					values: ['a.an:d,value'],
					displayValues: 'a.an:d,value'
				}
			};
	
			const serialized = serializeFilter([template], filter, jobsAndUsers, risks);
			expect(deserializeFilter([template], serialized, jobsAndUsers, risks)).toEqual(filter);
		});

		it('should support filters with "." and "," characters in select options', () => {
			const filter: TicketFilter = {
				type:'manyOf',
				property: 'Weird, options',
				module: '',
				filter: {
					operator: 'eq',
					values: ['E.M.H.-stuff', 'Gray, John','Ye:asda'],
					displayValues: 'E.M.H.-stuff, Gray, John, Ye:asda'
				}
			}

			const serialized = serializeFilter([template], filter, jobsAndUsers, risks);
			expect(deserializeFilter([template], serialized, jobsAndUsers, risks)).toEqual(filter);
		});

		it('should work when multiple templates are supplied', () => {
			const filter: TicketFilter = {
				module: '',
				property: 'long text',
				type: 'longText',
				filter: {
					operator: 'is',
					values: ['tomato'],
					displayValues: 'tomato'
				}
			};
	
			const serialized = serializeFilter(templates, filter, jobsAndUsers, risks);
			expect(deserializeFilter(templates, serialized, jobsAndUsers, risks)).toEqual(filter);
		});

		it('should throw an error when serializing if a property doesnt exist in the template', () => {
			const filter: TicketFilter = {
				type:'manyOf',
				property: 'Non existing',
				module: '',
				filter: {
					operator: 'eq',
					values: ['non', 'existing']
				}
			}

			expect(() => serializeFilter([template], filter, jobsAndUsers, risks)).toThrowError(InvalidPropertyError);
		});

		it('should throw an error when deserializing if a property doesnt exist in the template', () => {
			const serialized = "NonModule.Non existent:4:0,2,3";
			expect(() => deserializeFilter([template], serialized, jobsAndUsers, risks)).toThrowError(InvalidPropertyError);
		});

	})




	describe('sorting serialization', () => {
		it('should work with a TicketsSortingProperty types ascending', () => {
			const sortableProperties = Object.values(TicketsSortingPropertyDictionary);

			const possibleSortings = sortableProperties.map(property => ({
				property,
				order: 'asc' 
			}));

			possibleSortings.forEach(({ property, order}) => {
				const serialized = serializeSorting(property, order);
				expect(deserializeSorting(serialized)).toEqual([ property, order ]);
			});
		});

		it('should work with a TicketsSortingProperty types descending', () => {
			const sortableProperties = Object.values(TicketsSortingPropertyDictionary);

			const possibleSortings = sortableProperties.map(property => ({
				property,
				order: 'desc' 
			}));

			possibleSortings.forEach(({ property, order}) => {
				const serialized = serializeSorting(property, order);
				expect(deserializeSorting(serialized)).toEqual([ property, order ]);
			});
		});


		it('should work only with a property from sorting property name', () => {
			const property = 'Start Time';
		
			let serialized = serializeSorting(property, 'asc');
			expect(deserializeSorting(serialized)).toEqual([]);

			serialized = serializeSorting(property, 'desc');
			expect(deserializeSorting(serialized)).toEqual([]);
	
		});
	});
});
