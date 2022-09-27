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
	cardView: string;
	props?: any;
	setCardView: (view: string, extraProps?: any) => void
}

const defaultValue: CardContextType = { props: {}, cardView: '', setCardView: () => {} };
export const CardContext = createContext(defaultValue);
CardContext.displayName = 'CardContext';

export const CardContextComponent = ({ defaultView, children }) => {
	const [viewProps, setViewProps] = useState({ cardView: defaultView, props: {} });

	const setView = (newView, newExtraProps) => {
		setViewProps({ cardView: newView, props: newExtraProps });
	};

	return (
		<CardContext.Provider value={{ ...viewProps, setCardView: setView }}>
			{children}
		</CardContext.Provider>
	);
};

export const CardContextView = ({ cardView, children }) => {
	const contextValue = useContext(CardContext);
	return (
		<>{cardView === contextValue.cardView && children}</>
	);
};
