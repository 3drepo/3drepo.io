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

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { CustomEqualityCheck, ObservedProperties, SubscribeFn, SubscribableObject } from './performanceContext.types';
import { usePubSub } from '@/v5/services/pubSub';
import { cloneDeep } from 'lodash';

/* eslint-disable @typescript-eslint/comma-dangle */
const propertySetterInterceptor = <O,>(object: O, publish) => {
	const proxyHandler = {
		set: (obj, propName, newVal) => {
			const oldVal = obj[propName];
			if (oldVal !== newVal) {
				obj[propName] = newVal;
				publish(propName, newVal, oldVal);
			}
			return true;
		},
	};
	return new Proxy(object, proxyHandler) as O;
};

export const useSubscribableObject = <O,>(defaultValue: O) => {
	const { publish, subscribe } = usePubSub();
	const [state] = useState(propertySetterInterceptor(defaultValue, publish));
	return [state, subscribe] as [O, SubscribeFn<keyof typeof state>];
};

export const createPerformanceContext = <ContextState, ContextType extends SubscribableObject<ContextState>>(
	defaultValue: ContextType,
) => createContext(defaultValue) as React.Context<ContextType>;

export const usePerformanceContext = <ContextType extends SubscribableObject<any>>(
	context: React.Context<ContextType>,
	updatingCondition: CustomEqualityCheck<ContextType['state']> | ObservedProperties<ContextType['state']>
) => {
	const { state: contextState, subscribe, ...rest } = useContext(context);
	const [state, setState] = useState(contextState);
	const previousState = useRef(contextState);

	useEffect(() => {
		const updatingConditionIsAFunction = typeof updatingCondition === 'function';

		if (updatingConditionIsAFunction) {
			const shouldUpdate = updatingCondition as CustomEqualityCheck<typeof contextState>;

			return subscribe(Object.keys(contextState) as any, () => {
				const currentState = cloneDeep(contextState);
				if (shouldUpdate(currentState, previousState.current)) {
					setState(currentState);
				}
				previousState.current = currentState;
			});
		}

		const observedProperties = updatingCondition as ObservedProperties<typeof contextState>;
		return subscribe(observedProperties, () => {
			const currentState = cloneDeep(contextState);
			setState(currentState);
			previousState.current = currentState;
		});
	}, [updatingCondition]);

	return { ...state, ...rest, subscribe } as ContextType & ContextType['state'];
};