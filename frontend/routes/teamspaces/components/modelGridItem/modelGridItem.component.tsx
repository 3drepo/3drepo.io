/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import React, { useState } from 'react';

import { Container } from './modelGridItem.styles';

interface IProps {
	className?: string;
	name: string;
	model: string;
	permissions: any[];
	projectName: string;
	status: string;
	timestamp: string;
	federate: boolean;
}

export function ModelGridItem({ name, className, federate = false}: IProps) {
	console.log('props', name);
	return (
		<Container className={className} federate={federate}>
			{name}
		</Container>
	);
}
