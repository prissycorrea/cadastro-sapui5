sap.ui.define(
  ["sap/ui/core/util/MockServer", "sapui5/project/utils/ReaderJson"],
  (MockServer, ReaderJson) => {
    "use strict";

    const originPath = "sapui5/project";

    async function getRequests() {
      const mockdata = `${originPath}/localService/mockdata`;

      const [usersFirstPage, usersSecondPage] = await Promise.all([
        ReaderJson.getJson(`${mockdata}/usersFirstPage.json`),
        ReaderJson.getJson(`${mockdata}/usersSecondPage.json`),
      ]);

      return [
        {
          method: "GET",
          path: /getUsers\?page=0?/,
          response: (oXhr) => {
            oXhr.respondJSON(200, {}, usersFirstPage);
            return true;
          },
        },
        {
          method: "GET",
          path: /getUsers\?page=1?/,
          response: (oXhr) => {
            oXhr.respondJSON(200, {}, usersSecondPage);
            return true;
          },
        },
        {
          method: "DELETE",
          path: /delete\?userId=(.+)?/,
          response: (oXhr) => {
            oXhr.respondJSON(204, {}, "");
            return true;
          },
        },
      ];
    }

    return {
      async init() {
        const manifest = await ReaderJson.getJson(
          `${originPath}/manifest.json`
        );
        const rootUri = manifest.envs.microserviceUrl + "/";

        const mockServer = new MockServer({
          rootUri,
          requests: await getRequests(),
        });

        MockServer.config({
          autoRespond: true,
          autoRespondAfter: 300,
        });

        mockServer.start();
      },
    };
  }
);
