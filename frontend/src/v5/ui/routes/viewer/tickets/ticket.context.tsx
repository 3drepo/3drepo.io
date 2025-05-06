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
import { createContext, useState } from 'react';

export enum TicketDetailsView {
	Form,
	Groups,
}

export interface TicketContextType {
	isViewer?: boolean;
	containerOrFederation: string;
	availableTemplateIds: string[];
	detailsView: TicketDetailsView;
	detailsViewProps?: any;
	setDetailViewAndProps: (view: TicketDetailsView, props?: any) => void;
}

const defaultValue: TicketContextType = {
	isViewer: false,
	detailsView: TicketDetailsView.Form,
	containerOrFederation: '',
	availableTemplateIds: [],
	setDetailViewAndProps: () => {},
};
export const TicketContext = createContext(defaultValue);
TicketContext.displayName = 'TicketContext';

export const TicketContextComponent = ({
	children, isViewer = false, containerOrFederation, availableTemplateIds }) => {
	const [detailsView, setView] = useState(TicketDetailsView.Form);
	const [detailsViewProps, setViewProps] = useState();

	const setDetailViewAndProps = (viewParam: TicketDetailsView, props) => {
		if (props) {
			setViewProps(props);
		}
		setView(viewParam);
	};

	return (
		<TicketContext.Provider value={{ isViewer, detailsView, detailsViewProps, containerOrFederation, availableTemplateIds, setDetailViewAndProps }}>
			{children}
		</TicketContext.Provider>
	);
};
