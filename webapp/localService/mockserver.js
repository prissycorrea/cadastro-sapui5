sap.ui.define(
  ["sap/ui/core/util/MockServer", "sapui5/project/utils/ReaderJson"],
  (MockServer, ReaderJson) => {
    "use strict";

    const originPath = "sapui5/project";

    async function getRequests() {
      const mockdata = `${originPath}/localService/mockdata`;

      const [users] = await Promise.all([
        ReaderJson.getJson(`${mockdata}/users.json`),
      ]);

      return [
        {
          method: "GET",
          path: "getUsers",
          response: (oXhr) => {
            oXhr.respondJSON(200, {}, users);
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
