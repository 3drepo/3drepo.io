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

import { ViewpointsList } from './viewsList.styles';
import { ViewItem } from './viewItem/viewItem.component';

export const ViewsList = ({ viewpoints, editMode, activeViewpoint, setActiveViewpoint }) => {
	const filteredViewpoints = viewpoints; // add filtering logic

	// if (!viewpoints.length) {
	//     return (<div>No viewpoints created</div>);
	// }
	// if (!filteredViewpoints.length) {
	//     return (<div>No viewpoints available</div>);
	// }

	return (
		<ViewpointsList>
			{filteredViewpoints.map((viewpoint) => (
				<ViewItem
					key={viewpoint._id}
					viewpoint={viewpoint}
				/>
			))}
			{/* {this.renderNewViewpoint(this.props.newViewpoint)} */}
		</ViewpointsList>
	);
}