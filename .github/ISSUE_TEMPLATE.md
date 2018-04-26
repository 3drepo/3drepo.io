<!-- 
        ==================================== READ ME ======================================
            To create an issue in 3D Repo, please follow one of the 3 provided templates: 
                - Feature: When this is a new feature
                - Bug report: When you wish to report a bug you've found
                - Bug list: When you are creating a testing report on a release candidate
        ====================================================================================
-->
<!-- FEATURE TEMPLATE (delete as appropriate) -->
<!-- Remember to tag this issue as a feature! -->
### Description
<!-- What is the feature, is it associated with any other issues? (list here) -->
Adding the Groups feature into 3D Repo, allowing the user to create/edit/delete groups

### Goals
<!-- Acceptance criteria : What journeys should the user be able to complete to consider your feature done -->
<!-- Be as specific as you can, check them off once they work. Add more if you find more requirements during development. Issue should only be considered done after all of them are checked -->
- [ ] Collaborators/admins can create groups
- [ ] viewers cannot create groups
- [ ] clicking on a group highlights the group objects in viewer
<!-- etc etc.. -->

### Tasks
<!-- base on the goals, deduce the tasks required. check them off once they're done -->
- [ ] A new Group panel
- [ ] List group component
- [ ] edit group component
- [ ] new API end point to remove groups
- [ ] New database schema for groups (present it here)
<!-- etc etc.. -->
<!-- END OF FEATURE TEMPLATE -->

<!-- BUG(S) REPORT TEMPLATE (delete as appropriate) -->
<!-- Label this issue as "bug" -->
### Description
Highlighting objects on a federation node that would highlight multiple sub models is not functioning.

### Steps to replicate
- click on the root node of a federated tree
- The entire model should be highlighted, but only one of the models was highlighted.

### Pictures/ Gifs of the error
<!-- to help visualise what is wrong -->

<!-- END OF BUG(S) REPORT TEMPLATE -->
<!-- BUG LIST TEMPLATE (delete as appropriate) -->
### Bugs
- [ ] Bug 1 <!-- add link to comment, which should have a format similar to bug report -->
- [ ] Bug 2 <!-- add link to comment, which should have a format similar to bug report -->
- [ ] Bug 3 <!-- add link to comment, which should have a format similar to bug report -->
 
### UI Oddities
- [ ] Weird UI 1 <!-- add link to comment, which should have a format similar to bug report -->
- [ ] Weird UI 2 <!-- add link to comment, which should have a format similar to bug report -->
- [ ] Weird UI 3 <!-- add link to comment, which should have a format similar to bug report -->

<!-- END OF BUG(S) REPORT TEMPLATE -->
