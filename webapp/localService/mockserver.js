sap.ui.define(
  ["sap/ui/core/util/MockServer", "sapui5/project/utils/ReaderJson"],
  (MockServer, ReaderJson) => {
    "use strict";

    const originPath = "sapui5/project";

    async function getRequests() {
      return [
        {
          method: "GET",
          path: /.+/,
          response: (oXhr) => {
            oXhr.respondJSON(200, {}, {});
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
