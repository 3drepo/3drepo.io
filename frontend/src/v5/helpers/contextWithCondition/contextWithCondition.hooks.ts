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

import { useContext, useEffect, useRef, useState } from 'react';
import { UpdatingCondition, DependencyArray, SubscribableObject } from './contextWithCondition.types';
import { usePubSub } from '@/v5/services/pubSub';
import { cloneDeep } from 'lodash';

/* eslint-disable @typescript-eslint/comma-dangle */
const propertySetterInterceptor = <O,>(object: O, onChange) => {
	const proxyHandler = {
		set: (obj, propName, newVal) => {
			const oldVal = obj[propName];
			if (oldVal === newVal) return false;

			obj[propName] = newVal;
			onChange(propName, newVal, oldVal);
			return true;
		},
	};
	return new Proxy(object, proxyHandler) as O;
};

export const useSubscribableState = <O extends Record<string, unknown>>(defaultValue = {} as O) => {
	const { publish, subscribe } = usePubSub();
	const previousState = useRef<O>(cloneDeep(defaultValue));
	const [state] = useState(propertySetterInterceptor(defaultValue, (prop: string, newVal, oldVal) => {
		(previousState.current as any)[prop] = cloneDeep(oldVal);
		publish(prop, newVal, oldVal);
	}));

	return [state, previousState, subscribe] as const;
};

export const useContextWithCondition = <ContextType extends SubscribableObject<any>>(
	context: React.Context<ContextType>,
	dependencyArray: DependencyArray<ContextType['state']>,
	updatingCondition?: UpdatingCondition<ContextType['state'], ContextType>
) => {
	const { state: contextState, previousState, subscribe, ...rest } = useContext(context);
	const [state, setState] = useState(contextState);

	useEffect(() => {
		return subscribe(dependencyArray, () => {
			if (!updatingCondition || updatingCondition(contextState, previousState.current, rest)) {
				setState({ ...contextState });
			}
		});
	}, [dependencyArray, updatingCondition]);

	return { ...state, ...rest, subscribe } as ContextType & ContextType['state'];
};