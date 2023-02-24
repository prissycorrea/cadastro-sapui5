sap.ui.define(
  [
    "sapui5/project/controller/Base.controller",
    "sap/ui/core/Fragment",
    "sapui5/project/utils/UserInfo",
  ],

  function (BaseController, Fragment, UserInfo) {
    "use strict";

    return BaseController.extend("sapui5.project.controller.Home", {
      async _userUpdate() {
        const data = await UserInfo.getUsers();

        console.log(data);
      },

      async onInit() {
        await this._userUpdate();
      },

      openForm() {
        this.openDialog(
          "Formulário",
          "dialogId",
          "sapui5.project.fragments.Form"
        );
      },

      closeForm() {
        this.closeDialog("dialogId");
      },
    });
  }
);
