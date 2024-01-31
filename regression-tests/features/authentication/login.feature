#  Copyright (C) 2023 3D Repo Ltd
#  
#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU Affero General Public License as
#  published by the Free Software Foundation, either version 3 of the
#  License, or (at your option) any later version.
#  
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU Affero General Public License for more details.
#  
#  You should have received a copy of the GNU Affero General Public License
#  along with this program.  If not, see <http://www.gnu.org/licenses/>.

Feature: Login
	Scenario: Going to default page should redirect to v5 login page
		Given I navigate to '/'
		Then I should be redirected to the 'login' page
	
	Scenario: Going to page that requires authentication should redirect back to login page
		Given I navigate to the 'dashboard' page
		Then I should be redirected to the 'login' page

	Scenario: You can log into 3D Repo with a valid username and password
		Given I navigate to the 'login' page
		When I sign in as 'viewer'
		Then I should be redirected to the 'dashboard' page

	Scenario: Upon log in, you should be redirected to the page you wish to go
		Given I navigate to the 'viewer teamspace settings' page
		When I sign in as 'viewer'
		Then I should be redirected to the 'viewer teamspace settings' page

	Scenario: Logging in with email address
		Given I sign in with:
			| Username                       | Password      |
  			| homerJSimpson@mailinator.com   | homerJSimpson |
		Then I should be redirected to the 'dashboard' page
	
	Scenario: Loggin in with email address (case insensitive)
		Given I sign in with:
			| Username                      | Password      |
  			| HOMERJSimpson@mailinATor.com  | homerJSimpson |
		Then I should be redirected to the 'dashboard' page
	
	Scenario: Logging in with the wrong password
		Given I sign in with:
			| Username        | Password  |
  			| homerJSimpson   | hahawrong |
		Then I wait until "Incorrect username or password" text appears
	
	Scenario: Logging in with the wrong username
		Given I sign in with:
			| Username        	| Password      |
  			| hammeerJSimpson   | homerJSimpson |
		Then I wait until "Incorrect username or password" text appears 	

	Scenario: Logging in with the wrong email
		Given I sign in with:
			| Username        	               | Password      |
  			| hammeerJSimpson@mailinator.com   | homerJSimpson |
		Then I wait until "Incorrect username or password" text appears
	
	# Scenario: Logging in elsewhere
	# 	Given I sign in with:
	# 		| Username        | Password      |
  	# 		| homerJSimpson   | homerJSimpson |
	# 	And I in another browser
	# 	Given I sign in with:
	# 		| Username        | Password      |
  	# 		| homerJSimpson   | homerJSimpson |
	# 	When I switch back
		# Then I wait until "Incorrect username or password" text appears