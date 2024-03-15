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

import { createContext, useState } from 'react';

export type UploadFieldArray<T> = { uploads: T[]; };
export interface UploadsContextType<T> {
	fields: UploadFieldArray<T>;
	selectedId: string;
	setSelectedId: (id?: string) => void;
}

const defaultValue: UploadsContextType<any> = {
	fields: { uploads: [] },
	selectedId: null,
	setSelectedId: () => {},
};

export const UploadFilesContext = createContext(defaultValue);
UploadFilesContext.displayName = 'UploadFilesContext';

export interface UploadsContextProps<T> {
	fields: UploadFieldArray<T>,
	children: any,
}
export const UploadFilesContextComponent = ({ fields, children }: UploadsContextProps<any>) => {
	const [selectedId, setSelectedId] = useState(null);

	return (
		<UploadFilesContext.Provider value={{ fields, selectedId, setSelectedId }}>
			{children}
		</UploadFilesContext.Provider>
	);
};
