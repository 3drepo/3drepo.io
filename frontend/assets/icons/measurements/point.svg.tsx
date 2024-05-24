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
	<svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path 
			d="M9.00181 7.16161C9.14147 6.84124 8.99498 6.46831 8.67461 6.32864C8.147 6.09863 7.7802 5.57309 7.7802 4.96328C7.7802 4.32514 8.18207 3.77927 8.74867 3.56799C9.07614 3.44588 9.24262 3.08143 9.12051 2.75396C8.9984 2.42649 8.63395 2.26002 8.30648 2.38213C7.26089 2.77201 6.51457 3.77969 6.51457 4.96328C6.51457 6.0944 7.19637 7.06487 8.16884 7.48881C8.48921 7.62848 8.86214 7.48199 9.00181 7.16161Z" 
			fill="currentColor"/>
		<path 
			fillRule="evenodd" 
			clipRule="evenodd" 
			d="M4.06055 5.02734C4.06055 2.29936 6.27202 0.0878906 9 0.0878906C11.728 0.0878906 13.9395 2.29936 13.9395 5.02734C13.9395 7.54093 12.0619 9.61599 9.63281 9.92664L9.63281 17.3672C9.63281 17.7167 9.34949 18 9 18C8.65051 18 8.36719 17.7167 8.36719 17.3672L8.36719 9.92664C5.93806 9.61599 4.06055 7.54093 4.06055 5.02734ZM9 1.35352C6.971 1.35352 5.32617 2.99834 5.32617 5.02734C5.32617 7.05634 6.971 8.70117 9 8.70117C11.029 8.70117 12.6738 7.05634 12.6738 5.02734C12.6738 2.99834 11.029 1.35352 9 1.35352Z" 
			fill="currentColor"/>
	</svg>
);
