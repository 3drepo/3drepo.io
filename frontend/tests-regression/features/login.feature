Feature: Login
	Scenario: Going to default page should redirect to v5 login page
		Given Im not logged in
		When I navigate to '/'
		Then I should be redirected to the 'login' page
	
	# Scenario: Going to page that requires authentication should redirect back to login page
	# 	Given Im not logged in 
	# 	And I navigate to the 'dashboard' page
	# 	Then I should be redirected to the 'login' page

	# Scenario: You can log into 3D Repo with a valid username and password
	# 	Given I navigate to the 'login' page
	# 	When I log in as 'viewer'
	# 	Then I should be redirected to the 'dashboard' page

	# Scenario: Upon log in, you should be redirected to the page you wish to go
	# 	When Im not logged in 
	# 	And I navigate to the 'viewers settings' page
	# 	When I login as 'viewer'
	# 	Then I should be redirected to the 'viewers settings' page
