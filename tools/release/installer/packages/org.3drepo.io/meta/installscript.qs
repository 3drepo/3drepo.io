function Component()
{
    installer.installationFinished.connect(this, Component.prototype.installationFinishedPageIsShown);
    installer.finishButtonClicked.connect(this, Component.prototype.installationFinished);
}

Component.prototype.createOperations = function()
{
    component.createOperations();
}

Component.prototype.installationFinishedPageIsShown = function()
{
    try {
        if (installer.isInstaller() && installer.status == QInstaller.Success) {
            installer.addWizardPageItem( component, "LaunchDependenciesForm", QInstaller.InstallationFinished );
        }
    } catch(e) {
        console.log(e);
    }
}

Component.prototype.installationFinished = function()
{
    try {
        if (installer.isInstaller() && installer.status == QInstaller.Success) {
            var isMongoCheckBoxChecked = component.userInterface( "LaunchDependenciesForm" ).mongoCheckBox.checked;
            var isNodeCheckBoxChecked = component.userInterface( "LaunchDependenciesForm" ).nodeCheckBox.checked;
            if (isMongoCheckBoxChecked) {
                QDesktopServices.openUrl("file:///" + installer.value("TargetDir") + "/Downloads - MongoDB.url");
            }
            if (isNodeCheckBoxChecked) {
                QDesktopServices.openUrl("file:///" + installer.value("TargetDir") + "/Downloads - NodeJS.url");
            }
        }
    } catch(e) {
        console.log(e);
    }
}
