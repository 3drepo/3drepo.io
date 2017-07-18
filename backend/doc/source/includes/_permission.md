# Permission

There are three levels of permissions

* Account (team space) level permissions
* project level permissions
* model level permissions

## Account level

Permission       | meaning
-----------------|--------------- 
teamspace_admin  | owner of the teamspace, can perform any actions on this teamspace and also projects and models under this teamspace
assign_licence   |
revoke_licence   |
create_project   |
create_job       |
delete_job       |
assign_job       |
view_projects    | View all the projects and models under a teamspace

## Project level

Permission       | meaning
-----------------|--------------- 
create_model     |
create_federation|
admin_project    | permission to assign project permissions to other users
edit_project     |
delete_project   |
upload_files_all_models	|  permission to perform upload to all models in a project
edit_federation_all_models | permission to edit all federated models in a project
create_issue_all_models | permission to create issues in all models in a project
comment_issue_all_models | permission to comment issues in all models in a project
view_issue_all_models | permission to view issues in all models in a project
view_model_all_models | permission to view all models in a project
download_model_all_models | permission to download all models in a project
change_model_settings_all_models | permission to change all model settings in a project

## Model level
Permission       | meaning
-----------------|--------------- 
change_model_settings|
upload_files|
create_issue|
comment_issue|
view_issue|
view_model|
download_model|
edit_federation|
delete_federation|
delete_model|
manage_model_permission|