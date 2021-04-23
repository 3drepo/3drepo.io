import { deleteDB, openDB, DBSchema, IDBPDatabase } from 'idb';
import React from 'react';

export const STORE_NAME = {
	FRAMES: 'frames',
};

export interface IDataCache {
	name: string;
	db: DBSchema;
	create: (storeNames: string[]) => void;
	getValue: (storeName: string, key: string) => Promise<any>;
	putValue: (storeName: string, key: string, value: object) => Promise<any>;
	delete: () => void;
}

export class DataCacheService {
	private readonly name: string;
	private db: IDBPDatabase;
	private cacheReady: Promise<any>;

	constructor(name: string) {
		this.name = name;
		this.cacheReady = this.create([STORE_NAME.FRAMES]);
	}

	public async create(storeNames: string[]) {
		try {
			this.db = await openDB(this.name, 1, {
				upgrade(db: IDBPDatabase) {
					for (const storeName of storeNames) {
						if (db.objectStoreNames.contains(storeName)) {
							continue;
						}
						db.createObjectStore(storeName);
					}
				},
			});
		} catch (error) {
			console.error('Error while creating cache store: ', error);
		}
	}

	public async getValue(storeName: string, key: string) {
		await this.cacheReady;
		return this.db.get(storeName, key);
	}

	public async putValue(storeName: string, key: string, value: object) {
		await this.cacheReady;
		return await this.db.put(storeName, value, key);
	}

	public async delete() {
		return deleteDB(this.name);
	}
}

export const DataCache = new DataCacheService('cache');

export const withDataCache = (WrappedComponent) => (props) => (
		<WrappedComponent dataCache={DataCache} {...props} />
);
