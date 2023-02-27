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
    const USER_MODEL = "user";

    return BaseController.extend("sapui5.project.controller.Home", {
      _getStatus(type) {
        const status = {
          INATIVO: { icon: "sap-icon://decline", color: "#8B0000" },
          ATIVO: { icon: "sap-icon://accept", color: "#006400" },
        };

        return status[type];
      },

      async _userUpdate(page, name, email, statusId) {
        const { Users, pageNumber, totalPages, totalItems } =
          await UserInfo.getUsers(page, name, email, statusId);

        Users.map((item) => {
          item.statusColor = this._getStatus(item.status.toUpperCase()).color;
          item.statusIcon = this._getStatus(item.status.toUpperCase()).icon;
        });

        this.setModel(USERS_MODEL, Users);
        this.setModel(SEARCH_STATUS_MODEL, {
          currentPage: pageNumber,
          totalPages,
          totalItems,
          name,
          email,
          statusId
        });

        this._enabledPaginationButton(page, totalPages);
      },

      async onInit() {
        const oBundle = this.getOwnerComponent()
        .getModel("i18n")
        .getResourceBundle();

        this._updateFilterTexts(oBundle);

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

      editUser(oEvent) {
        const user = oEvent
        .getSource()
        .getBindingContext(USERS_MODEL)
        .getObject();

        this.setModel(USER_MODEL, user);
        this.openDialog("Form", "dialogId", "sapui5.project.fragments.Form");
      },

      async save() {
        const that = this;
        const user = this.getModelValues(USER_MODEL);

        try {
          if (user.id) await UserInfo.updateUser(user);
          else await UserInfo.addUser(user);

          MessageBox.success("Operação realizada com sucesso", {
            actions: [MessageBox.Action.OK],
            emphasizedAction: MessageBox.Action.OK,
            onClose: function () {
              that.closeForm();
            }
          });

        } catch (err) {
          this.messageBox("error", "Ocorreu um erro ao realizar a operação. Tente novamente.")
        }

        //this.messageBox("success", "Sucesso")
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

      searchUser() {
        const {name, email, statusId} = this.getModelValues(SEARCH_STATUS_MODEL);

        Delay.debounce(async () => await this._userUpdate(0, name, email, statusId), 500);
      },

      clearFilters() {
        this.updateModel(SEARCH_STATUS_MODEL, {name: "", email: "", statusId: "-1"});
      },

      openForm() {
        this.openDialog(
          "Formulário",
          "dialogId",
          "sapui5.project.fragments.Form"
        );

        this.setModel(USER_MODEL, {name:"", email:"", statusId:0})
      },

      closeForm() {
        this.closeDialog("dialogId");
      },

      _updateFilterTexts(oBundle) {
        const oFilter = this.byId("filterBar");

        oFilter.addEventDelegate({
          onAfterRendering: function (oEvent) {
            const oButtonSearch = oEvent.srcControl._oSearchButton;
            const oButtonClear = oEvent.srcControl._oClearButtonOnFB;

            oButtonSearch.setText("Pesquisar");
            oButtonClear.setText("Limpar filtros");
          },
        });
      },
    });
  }
);