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

const MetaConstants = {};

// The order on this object determines the priority.
MetaConstants.idTypes = {
	IFC: 'ifc_guids',
	REVIT: 'revit_ids',
};

MetaConstants.idTypesToKeys = {
	[MetaConstants.idTypes.IFC]: ['IFC GUID', 'Ifc::IfcGUID', 'Element::IfcGUID', 'IFC Parameters::IfcGUID'],
	[MetaConstants.idTypes.REVIT]: ['Element ID', 'Element ID::Value', 'Tag', 'Element::IfcTag'],
};

MetaConstants.metaKeyToIdType = {};

Object.keys(MetaConstants.idTypesToKeys).forEach((idType) => {
	const keys = MetaConstants.idTypesToKeys[idType];
	keys.forEach((label) => {
		MetaConstants.metaKeyToIdType[label] = idType;
	});
});

module.exports = MetaConstants;
