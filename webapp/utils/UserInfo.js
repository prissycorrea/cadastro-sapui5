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

      async getUsers() {
        return this._request("getUsers");
      },
    };
  }
);
