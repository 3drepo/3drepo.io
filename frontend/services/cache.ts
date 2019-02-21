/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the multiSelect of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { omit, keys  } from 'lodash';

class CacheService {
	private cache = {};

	public add(namespace, id, data) {
		const key = this.getKey(namespace, id);
		this.cache[key] = JSON.stringify(data);
		return key;
	}

	public get(namespace, id) {
		const key = this.getKey(namespace, id);
		return JSON.parse(this.cache[key] || null);
	}

	public remove(namespace, id) {
		const key = this.getKey(namespace, id);
		delete this.cache[key];
	}

	public clear(namespace?) {
		if (namespace) {
			const keysToRemove = keys(this.cache).filter((key) => key.startsWith(namespace));
			this.cache = omit(this.cache, keysToRemove);
		} else {
			this.cache = {};
		}
	}

	private getKey = (namespace, id) => {
		return `${namespace}.${id}`;
	}
}

export const Cache = new CacheService();
