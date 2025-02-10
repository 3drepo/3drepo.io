/**
 *  Copyright (C) 2025 3D Repo Ltd
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
	<svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path
			fill="currentColor"
			d="m 9.0472506,-0.05845933 c -2.1953879,0 -4.2648738,0.83648718 -5.8203128,2.35351563 -1.550518,1.5148385 -2.40820298,3.5310865 -2.40820298,5.6777344 0,3.2612473 1.58042498,5.9740053 3.31445298,7.9707033 1.736799,1.999798 3.6811205,3.344473 4.5371096,3.888672 0.2302098,0.1464 0.5236965,0.1464 0.7539063,0 0.8559693,-0.544199 2.8003113,-1.888874 4.5371093,-3.888672 1.733998,-1.996698 3.314453,-4.709456 3.314453,-7.9707033 0,-2.1464879 -0.859258,-4.1631928 -2.410156,-5.6757812 -1.555498,-1.51962752 -3.623131,-2.35546883 -5.8183594,-2.35546883 z m -0.00586,4.67578123 c 2.0351604,0 3.6835934,1.6484517 3.6835934,3.6835938 0,2.0350873 -1.648433,3.6855473 -3.6835934,3.6855473 -2.035133,0 -3.6855474,-1.65046 -3.6855474,-3.6855473 1e-6,-2.0351421 1.6504144,-3.6835938 3.6855474,-3.6835938 z" 
		/>
	</svg>
);
