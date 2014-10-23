/**
 *  Copyright (C) 2014 3D Repo Ltd 
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
 a*/
 
 #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif

uniform vec3 light0_Direction;

varying vec3 fragNormal;
varying vec3 fragEyeVector; 
varying vec2 fragTexCoord;

void main()
{
	vec3 normal = normalize(fragNormal);
	vec3 eye    = normalize(fragEyeVector);                            
	vec3 rVec   = reflect(eye, normal);

	float spec = pow(max(0.0, dot(light0_Direction, rVec)), 27.0);     
	
	float diff = dot(-light0_Direction, normal);
	//vec3 col   = vec3(0.0, 1.0, 0.0);
    //vec3 col = normal;
    vec3 col = vec3(fragTexCoord, 0.0);
	
	gl_FragColor = vec4(col, 1.0);
}
