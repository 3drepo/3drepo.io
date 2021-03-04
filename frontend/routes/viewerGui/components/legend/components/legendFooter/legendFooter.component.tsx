/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import React from 'react';

import AddIcon from '@material-ui/icons/Add';

import { ILegend } from '../../../../../../modules/legend/legend.redux';
import { ViewerPanelButton, ViewerPanelFooter } from '../../../viewerPanel/viewerPanel.styles';

interface IProps {
	isPending: boolean;
	prepareNewLegendItem: (legendItem: ILegend) => void;
	colors: string[];
	updatePending: boolean;
	newLegendEditMode: boolean;
}

export const LegendFooter = ({
	isPending, prepareNewLegendItem, colors, updatePending, newLegendEditMode,
}: IProps) => {
	const handleAddNewLegendItem = () => prepareNewLegendItem({
		name: '',
		color: colors[Math.floor(Math.random() * colors.length)],
	});

	return (
		<ViewerPanelFooter container alignItems="center">
			<ViewerPanelButton
				aria-label="Add legend"
				onClick={handleAddNewLegendItem}
				disabled={isPending || newLegendEditMode}
				color="secondary"
				variant="fab"
				id="legend-add-new-button"
				pending={updatePending}
			>
				<AddIcon />
			</ViewerPanelButton>
		</ViewerPanelFooter>
	);
};
