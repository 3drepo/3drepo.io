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
			fillRule="evenodd" 
			clipRule="evenodd" 
			d="M2.25 0C1.00736 0 0 1.00736 0 2.25C0 3.49264 1.00736 4.5 2.25 4.5C3.49264 4.5 4.5 3.49264 4.5 2.25C4.5 1.00736 3.49264 0 2.25 0ZM1.26562 2.25C1.26562 2.79366 1.70634 3.23438 2.25 3.23438C2.79366 3.23438 3.23437 2.79366 3.23437 2.25C3.23437 1.70634 2.79366 1.26563 2.25 1.26563C1.70634 1.26563 1.26562 1.70634 1.26562 2.25Z" 
			fill="currentColor" 
		/>
		<path 
			d="M6.97886 5.47276C7.32835 5.47276 7.61167 5.18944 7.61167 4.83995C7.61167 4.49046 7.32835 4.20714 6.97886 4.20714H4.85754C4.6897 4.20714 4.52875 4.27381 4.41007 4.39248C4.2914 4.51116 4.22472 4.67212 4.22472 4.83995L4.22473 6.96127C4.22473 7.31076 4.50805 7.59408 4.85754 7.59408C5.20703 7.59408 5.49035 7.31076 5.49035 6.96127V6.35352L11.629 12.5184H11.0309C10.6814 12.5184 10.3981 12.8017 10.3981 13.1512C10.3981 13.5007 10.6814 13.784 11.0309 13.784H13.1522C13.32 13.784 13.481 13.7173 13.5997 13.5986C13.7184 13.48 13.785 13.319 13.785 13.1512V11.0299C13.785 10.6804 13.5017 10.397 13.1522 10.397C12.8027 10.397 12.5194 10.6804 12.5194 11.0299V11.6188L6.3994 5.47276H6.97886Z" 
			fill="currentColor" 
		/>
		<path 
			fillRule="evenodd" 
			clipRule="evenodd" 
			d="M13.5 15.75C13.5 14.5074 14.5074 13.5 15.75 13.5C16.9926 13.5 18 14.5074 18 15.75C18 16.9926 16.9926 18 15.75 18C14.5074 18 13.5 16.9926 13.5 15.75ZM15.75 16.7344C15.2063 16.7344 14.7656 16.2937 14.7656 15.75C14.7656 15.2063 15.2063 14.7656 15.75 14.7656C16.2937 14.7656 16.7344 15.2063 16.7344 15.75C16.7344 16.2937 16.2937 16.7344 15.75 16.7344Z" 
			fill="currentColor" />
	</svg>
);




