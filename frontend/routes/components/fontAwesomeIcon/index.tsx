/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import * as React from 'react';
import FontAwesomeIconComponent from './fontAwesomeIcon.component';

export const FontAwesomeIcon = FontAwesomeIconComponent;

// Before add new icon's component, add required fa icon to library in "services/fontAwesome"
export const Eraser = (props) => <FontAwesomeIconComponent {...props} icon="eraser" />;

export const Eye = (props) => <FontAwesomeIconComponent {...props} icon="eye" />;

export const Tint = (props) => <FontAwesomeIconComponent {...props} icon="tint" />;

export const HandPaper = (props) => <FontAwesomeIconComponent {...props} icon="hand-paper" />;
