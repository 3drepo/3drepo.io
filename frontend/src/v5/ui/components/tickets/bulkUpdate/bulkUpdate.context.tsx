/**
 *  Copyright (C) 2026 3D Repo Ltd
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

export interface TicketsBulkUpdateContextType {
	bulkModeOn: boolean;
	selectedItems: Set<string>;
	toggleBulkMode: () => void;
	toggleSelection: (elem) => void;
	isSelected: (elem) => boolean;
}

const defaultValue: TicketsBulkUpdateContextType = {
	bulkModeOn: false,
	selectedItems: new Set(),
	toggleBulkMode: () => {},
	toggleSelection: () => {},
	isSelected: () => false,
};


export const TicketsBulkUpdateContext = createContext<TicketsBulkUpdateContextType>(defaultValue);
TicketsBulkUpdateContext.displayName = 'TicketsBulkUpdateContext';

export const TicketsBulkUpdateContextComponent = ({ children }) => {
	const [bulkModeOn, setBulkMode] = useState(false);
	const [selectedItems, setSelectedItems] = useState(new Set<string>());

	const toggleBulkMode = () =>{
		if (bulkModeOn) {
			setSelectedItems(new Set());
		}

		setBulkMode((t) => !t);
	};

	const toggleSelection = (elem) => {
		const newSelection = new Set(selectedItems);
		if (!newSelection.has(elem)) {
			newSelection.add(elem);
		} else {
			newSelection.delete(elem);
		}
		setSelectedItems(newSelection);
	};

	const isSelected = (elem) => {
		return selectedItems.has(elem);
	};

	return (
		<TicketsBulkUpdateContext.Provider value={
			{ 
				bulkModeOn, 
				toggleBulkMode, 
				toggleSelection, 
				isSelected, 
				selectedItems, 
			}}>
			{children}
		</TicketsBulkUpdateContext.Provider>
	);
};