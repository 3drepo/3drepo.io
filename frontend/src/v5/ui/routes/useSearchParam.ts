/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { useHistory } from 'react-router-dom';

type Transformer<T> = {
	from: (param: string) => T,
	to: (param: T) => string,
};

export const Transformers = {
	DEFAULT: {
		from: (param = '') => param,
		to: (param = '') => param,
	},
	BOOLEAN: {
		from: (param) => JSON.parse(param || 'false'),
		to: JSON.stringify,
	},
	STRING_ARRAY: {
		from: (arr = '') => arr ? arr.split(',') : [],
		to: (arr: string[] = []) => arr.length ? arr.join(',') : '',
	},
};

// @ts-ignore
export const useSearchParam = <T = string>(name: string, transformer: Transformer<T> = Transformers.DEFAULT) => {
	const history = useHistory();
	const { location } = window;
	const value = transformer.from(new URLSearchParams(location.search).get(name));

	const setParam = (newValue: T) => {
		const searchParams = new URLSearchParams(location.search);
		const transformedNewValue = transformer.to(newValue);
		if (transformedNewValue) {
			searchParams.set(name, transformedNewValue);
		} else {
			searchParams.delete(name);
		}
		history.replace({ search: searchParams.toString() });
	};

	return [value, setParam] as [T, (val?: T) => void];
};
