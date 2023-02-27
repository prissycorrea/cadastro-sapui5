sap.ui.define(
  ["sapui5/project/utils/HttpRequest", "sapui5/project/utils/ReaderJson"],
  function (HttpRequest, ReaderJson) {
    "use strict";

    let ROOT_URL;

    return {
      async _getUrl() {
        if (ROOT_URL) return ROOT_URL;

        const manifest = await ReaderJson.getJson(
          "sapui5/project/manifest.json"
        );

        ROOT_URL = manifest.envs.microserviceUrl;

        return ROOT_URL;
      },

      async _request(path, method = "GET", data = {}) {
        const root = await this._getUrl();
        const url = `${root}/${path}`;

        return HttpRequest.request({
          url,
          data,
          method,
          contentType: "application/json",
        });
      },

      _user(form) {
        return JSON.stringify({
          name: form.name,
          email: form.email,
          status: form.status,
        })
      },

      async getUsers(page, name = "", email="", statusId = "-1") {
        const path = `getUsers?page=${page}&name=${name}&email=${email}&statusId=${statusId}`;
        return this._request(path);
      },

      async addUser(user) {
        this._request("create", "POST", user)
      },

      async updateUser(user) {
        const path = `update?userId=${user.id}`
        return this,this._request(path, "PUT", this._user(user))
      },

      async removeUser(userId) {
        const path = `delete?userId=${userId}`;
        return this._request(path, "DELETE");
      }
    };
  }
);
