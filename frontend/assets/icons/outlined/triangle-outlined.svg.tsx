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

type IProps = {
	className?: any;
};

export default ({ className }: IProps) => (
	<svg className={className} width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fillRule="evenodd" clipRule="evenodd" d="M9.50405 0.458984C9.73013 0.458984 9.93904 0.579598 10.0521 0.775391L18.0366 14.605C18.1496 14.8008 18.1496 15.042 18.0366 15.2378C17.9236 15.4336 17.7146 15.5542 17.4886 15.5542H1.51953C1.29345 15.5542 1.08454 15.4336 0.9715 15.2378C0.858458 15.042 0.858458 14.8008 0.9715 14.605L8.95602 0.775391C9.06906 0.579598 9.27797 0.458984 9.50405 0.458984ZM2.61559 14.2886H16.3925L9.50405 2.35742L2.61559 14.2886Z" fill="currentColor"/>
	</svg>
);
