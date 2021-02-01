import { deleteDB, openDB, IDBPDatabase } from 'idb';

export default class DataCaching {
	private readonly name: string;
	private db: any;

	constructor(name: string) {
		this.name = name;
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

	public async getValue(storeName: string, id: number) {
		const store = this.db
				.transaction(storeName, 'readonly')
				.objectStore(storeName);

		return await store.get(id);
	}

	public async putValue(storeName: string, value: object) {
		const store = this.db
				.transaction(storeName, 'readwrite')
				.objectStore(storeName);

		return await store.put(value);
	}

	public async delete() {
		return deleteDB(this.name);
	}
}
