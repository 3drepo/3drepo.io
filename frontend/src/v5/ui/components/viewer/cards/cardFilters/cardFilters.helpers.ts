/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import EqualIcon from '@assets/icons/filters/equal.svg';
import GreaterEqualThanIcon from '@assets/icons/filters/greater_than_equal.svg';
import GreaterEqualIcon from '@assets/icons/filters/greater_than.svg';
import NotEqualIcon from '@assets/icons/filters/not_equal.svg';
import LessThanIcon from '@assets/icons/filters/less_than.svg';
import LessEqualThanIcon from '@assets/icons/filters/less_than_equal.svg';
import InRangeIcon from '@assets/icons/filters/in_range.svg';
import NotInRangeIcon from '@assets/icons/filters/not_in_range.svg';
import ExistIcon from '@assets/icons/filters/exist.svg';
import NotExistIcon from '@assets/icons/filters/not_exist.svg';
import ContainIcon from '@assets/icons/filters/contain.svg';
import NotContainIcon from '@assets/icons/filters/not_contain.svg';
import { formatMessage } from '@/v5/services/intl';
import { TicketFilterOperator, TicketFilterType } from './cardFilters.types';
import { compact, floor } from 'lodash';
import { ITemplate } from '@/v5/store/tickets/tickets.types';
import { IUser } from '@/v5/store/users/users.redux';
import { IJob } from '@/v5/store/jobs/jobs.types';
import { getState } from '@/v5/helpers/redux.helpers';
import { selectFederationJobs, selectFederationUsers } from '@/v5/store/federations/federations.selectors';
import { selectContainerJobs, selectContainerUsers } from '@/v5/store/containers/containers.selectors';
import { FederationsHooksSelectors, ContainersHooksSelectors } from '@/v5/services/selectorsHooks';

export const FILTER_OPERATOR_ICON: Record<TicketFilterOperator, any> = {
	eq: EqualIcon,
	neq: NotEqualIcon,
	is: EqualIcon,
	nis: NotEqualIcon,
	gt: GreaterEqualIcon,
	gte: GreaterEqualThanIcon,
	lt: LessThanIcon,
	lte: LessEqualThanIcon,
	rng: InRangeIcon,
	nrng: NotInRangeIcon,
	ex: ExistIcon,
	nex: NotExistIcon,
	ss: ContainIcon,
	nss: NotContainIcon,
} as const;

export const FILTER_OPERATOR_LABEL: Record<TicketFilterOperator, string> = {
	ex: formatMessage({ id: 'cardFilter.operator.exists', defaultMessage: 'Exists' }),
	nex: formatMessage({ id: 'cardFilter.operator.doesNotExist', defaultMessage: 'Does not exist' }),
	eq: formatMessage({ id: 'cardFilter.operator.equals', defaultMessage: 'Equals' }),
	neq: formatMessage({ id: 'cardFilter.operator.doesNotEqual', defaultMessage: 'Does not equal' }),
	is: formatMessage({ id: 'cardFilter.operator.is', defaultMessage: 'Is' }),
	nis: formatMessage({ id: 'cardFilter.operator.isNot', defaultMessage: 'Is not' }),
	gt: formatMessage({ id: 'cardFilter.operator.greaterThan', defaultMessage: 'Greater than' }),
	gte: formatMessage({ id: 'cardFilter.operator.greaterOrEqualTo', defaultMessage: 'Greater or equal to' }),
	lt: formatMessage({ id: 'cardFilter.operator.lessThan', defaultMessage: 'Less than' }),
	lte: formatMessage({ id: 'cardFilter.operator.lessOrEqualTo', defaultMessage: 'Less or equal to' }),
	rng: formatMessage({ id: 'cardFilter.operator.inRange', defaultMessage: 'In range' }),
	nrng: formatMessage({ id: 'cardFilter.operator.notInRange', defaultMessage: 'Not in range' }),
	ss: formatMessage({ id: 'cardFilter.operator.contains', defaultMessage: 'Contains' }),
	nss: formatMessage({ id: 'cardFilter.operator.notContain', defaultMessage: 'Does not contain' }),
};

const DATE_FILTER_OPERATOR_LABEL: Record<TicketFilterOperator, string> = {
	...FILTER_OPERATOR_LABEL,
	gte: formatMessage({ id: 'cardFilter.date.operator.onOrAfter', defaultMessage: 'On or after' }),
	lte: formatMessage({ id: 'cardFilter.date.operator.onOrBefore', defaultMessage: 'On or before' }),
};

export const isDateType = (type: TicketFilterType) => ['date', 'pastDate', 'createdAt', 'updatedAt', 'sequencing'].includes(type);
export const isTextType = (type: TicketFilterType) => ['ticketCode', 'title', 'text', 'longText'].includes(type);
export const isSelectType = (type: TicketFilterType) => ['template', 'oneOf', 'manyOf', 'owner', 'status'].includes(type);

export const getFilterOperatorLabels = (type: TicketFilterType) => isDateType(type) ? DATE_FILTER_OPERATOR_LABEL : FILTER_OPERATOR_LABEL;

export const getFilterFormTitle = (elements: string[]) => compact(elements).join(' : ');

export const floorToMinute = (time) => 60000 * floor(time / 60000);
export const amendDateUpperBounds = (bounds) => {
	return bounds.map((bound, i) => {
		if (i !== bounds.length - 1) return bound;
		return floorToMinute(bound) + 59999;
	});
};

export const isRangeOperator = (operator: TicketFilterOperator) => ['rng', 'nrng'].includes(operator);
	
export const getDefaultOperator = (type) => {
	if (isTextType(type) || isSelectType(type)) return 'is';
	if (isDateType(type)) return 'lte';
	return 'eq';
};

const findByNameOrType = <T extends { name?:string, type?:string }>(arr: T[], nameToFind, typeToFind?) => 
	arr?.find(( { name, type }) =>
		name === nameToFind || (typeToFind ? type === typeToFind : false));

export const getTemplateProperty = (template:ITemplate, module: string | undefined, propertyName: string) => {
	return findByNameOrType((module ?  findByNameOrType(template.modules, module, module) : template)?.properties, propertyName);
};


// returns an array of all users_ids and jobs_ids from the passed containers and Federations 
export const useGetUsersAndJobs = (containersAndFederations: string[]): IUser[] | IJob[] => {
	// This is for triggering a new re render if these federations or containers change
	// in order to have the latests users/jobs
	FederationsHooksSelectors.selectFederations(); 
	ContainersHooksSelectors.selectContainers(); 
	 
	const usersAndJobsSet = new Set<string>();
	const usersAndJobs: IUser[] | IJob[] = [];

	const addToUsersAndJobOnce = (arr: any[]) => {
		arr.forEach((jobOrUser) => {
			const id = jobOrUser._id || jobOrUser.user;
			if (usersAndJobsSet.has((id))) return;
			usersAndJobsSet.add(id);
			usersAndJobs.push(jobOrUser);
		});
	};

	containersAndFederations.forEach((containerOrFederation) => {
		addToUsersAndJobOnce(selectFederationJobs(getState(), containerOrFederation));
		addToUsersAndJobOnce(selectContainerJobs(getState(), containerOrFederation));
		addToUsersAndJobOnce(selectFederationUsers(getState(), containerOrFederation));
		addToUsersAndJobOnce(selectContainerUsers(getState(), containerOrFederation));
	});

	return usersAndJobs;
};
