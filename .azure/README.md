This folder contains configurations for CD, driven by Azure DevOps (AZP). There are 3 pipelines defined:

- build
- build and deploy
- destroy

They should match the pipelines defined in the 3drepo's AZP account.

#### Build
- Description: Build simply builds a container for the commit in question and stores the container in 3DR's ACR.
- Trigger: Never (build and deploy handles CD, therefore it is only designed to be triggered manually, if required)

NOTE: container is build with the commit has as its name.

#### Build and Deploy
- Description: It does everything Build does, then deploys the container onto 3DR's staging deployment in AKS. The deployment can be found in `https://<branch name with>.dev.3drepo.io` (e.g. https://ISSUE-1234.dev.3drepo.io)
- Trigger: this is triggered for every commit in master and staging, and on demand on a PR via `/azp run`.

NOTE: the `/azp run` deployment is defined by a combination of no specific PR definitions in the yaml, plus the pipeline settings configuration PR validation to only run if a team member has commented on the PR.

#### destroy
- Description: Destroys the deployment
- Trigger: (CF) I'm struggling to find how it's exactly triggered at the moment, whoever finds the answer, please add it onto this readme!

