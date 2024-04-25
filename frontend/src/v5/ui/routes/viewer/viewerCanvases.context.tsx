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

interface ViewerCanvasesContextType {
	is2DOpen?: boolean;
	toggle2DPanel: () => void;
	leftPanelRatio: number;
	setLeftPanelRatio: (size) => void;
}

const defaultValue: ViewerCanvasesContextType = {
	is2DOpen: false,
	toggle2DPanel: () => { },
	leftPanelRatio: 50,
	setLeftPanelRatio: () => { },
};
export const ViewerCanvasesContext = createContext(defaultValue);
ViewerCanvasesContext.displayName = 'ViewerCanvasesContext';

export const ViewerCanvasesContextComponent = ({ children }) => {
	const [is2DOpen, setIs2DOpen] = useState(false);
	const [leftPanelRatio, setLeftPanelRatio] = useState(50);

	const toggle2DPanel = () => setIs2DOpen(!is2DOpen);

	return (
		<ViewerCanvasesContext.Provider value={{ is2DOpen, toggle2DPanel, leftPanelRatio, setLeftPanelRatio }}>
			{children}
		</ViewerCanvasesContext.Provider>
	);
};
