sap.ui.define(
  [
    "sapui5/project/controller/Base.controller",
    "sapui5/project/utils/UserInfo",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],

  function (BaseController, UserInfo, MessageBox, MessageToast) {
    "use strict";

    const USERS_MODEL = "users";
    const SEARCH_STATUS_MODEL = "searchStatus";

    return BaseController.extend("sapui5.project.controller.Home", {
      _getStatus(type) {
        const status = {
          INATIVO: { icon: "sap-icon://decline", color: "#8B0000" },
          ATIVO: { icon: "sap-icon://accept", color: "#006400" },
        };

        return status[type];
      },

      async _userUpdate(page) {
        const { Users, pageNumber, totalPages, totalItems } =
          await UserInfo.getUsers(page);

        Users.map((item) => {
          item.statusColor = this._getStatus(item.status.toUpperCase()).color;
          item.statusIcon = this._getStatus(item.status.toUpperCase()).icon;
        });

        this.setModel(USERS_MODEL, Users);
        this.setModel(SEARCH_STATUS_MODEL, {
          currentPage: pageNumber,
          totalPages,
          totalItems,
        });

        this._enabledPaginationButton(page, totalPages);
      },

      async onInit() {
        this.refresh(this._onDisplay);
      },

      async _onDisplay() {
        await this._userUpdate(0);
      },

      async changePage(page) {
        const { currentPage, totalPages } =
          this.getModelValues(SEARCH_STATUS_MODEL);

        let nextPage = currentPage + page;
        if (nextPage < 0) nextPage = 0;
        if (nextPage >= totalPages) nextPage = totalPages - 1;

        await this._userUpdate(nextPage);
      },

      _enabledPaginationButton(page, totalPages) {
        const prevBtn = this.byId("prevButton");
        const nextBtn = this.byId("nextButton");

        if (page === 0) {
          prevBtn.setEnabled(false);
        } else {
          prevBtn.setEnabled(true);
        }

        if (page < totalPages - 1) {
          nextBtn.setEnabled(true);
        } else {
          nextBtn.setEnabled(false);
        }
      },

      async deleteUser(userId) {
        MessageBox.confirm(
          "Deseja realmente deletar o usuário?",
          async (evt) => {
            if (evt == "OK") {
              await UserInfo.removeUser(userId);

              MessageBox.success("Operação realizada com sucesso");
            } else {
              MessageToast.show("Operação cancelada");
            }
          }
        );
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