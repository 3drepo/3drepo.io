/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { createContext, useContext, useState } from 'react';

export interface CardContextType {
	view: any;
	props?: any;
	setView: (view: any, extraProps?: any) => void
}

const defaultValue: CardContextType = { props: {}, view: {}, setView: () => {} };
export const CardContext = createContext(defaultValue);
CardContext.displayName = 'CardContext';

export const CardContextComponent = ({ defaultView, children }) => {
	const [viewProps, setViewProps] = useState({ view: defaultView, props: {} });

	const setView = (newView, newExtraProps) => {
		setViewProps({ view: newView, props: newExtraProps });
	};

	return (
		<CardContext.Provider value={{ ...viewProps, setView }}>
			{children}
		</CardContext.Provider>
	);
};

export const CardContextView = ({ view, children }) => {
	const contextValue = useContext(CardContext);
	return (
		<>{view === contextValue.view && children}</>
	);
};
