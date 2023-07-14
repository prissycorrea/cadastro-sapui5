sap.ui.define(
  ["sap/ui/core/util/MockServer", "sapui5/project/utils/ReaderJson"],
  (MockServer, ReaderJson) => {
    "use strict";

    const originPath = "sapui5/project";

    async function getRequests() {
      const mockdata = `${originPath}/localService/mockdata`;

      const [usersFirstPage, usersSecondPage, user, userFilter] =
        await Promise.all([
          ReaderJson.getJson(`${mockdata}/usersFirstPage.json`),
          ReaderJson.getJson(`${mockdata}/usersSecondPage.json`),
          ReaderJson.getJson(`${mockdata}/user.json`),
          ReaderJson.getJson(`${mockdata}/userFilter.json`),
        ]);

      return [
        {
          method: "GET",
          path: /getUsers\?page=0&name=(.+)?&email=(.+)?&statusId=(.+)?/,
          response: (oXhr) => {
            console.log(oXhr.url);

            if (
              oXhr.url.includes("Monique") ||
              oXhr.url.includes("mjobke0") ||
              oXhr.url.includes("statusId=0")
            ) {
              oXhr.respondJSON(200, {}, userFilter);
            } else {
              oXhr.respondJSON(200, {}, usersFirstPage);
            }

            return true;
          },
        },
        {
          method: "GET",
          path: /getUsers\?page=1&name=(.+)?&email=(.+)?&statusId=(.+)?/,
          response: (oXhr) => {
            oXhr.respondJSON(200, {}, usersSecondPage);
            return true;
          },
        },
        {
          method: "POST",
          path: /create/,
          response: (oXhr) => {
            console.log(oXhr);
            oXhr.respondJSON(200, {}, user);
            return true;
          },
        },
        {
          method: "PUT",
          path: /update\?userId=(.+)?/,
          response: (oXhr) => {
            oXhr.respondJSON(200, {}, user);
            return true;
          },
        },
        {
          method: "DELETE",
          path: /delete\?userId=(.+)?/,
          response: (oXhr) => {
            if (oXhr.url.includes("userId=2")) {
              oXhr.respondJSON(404, {}, "");
            } else {
              oXhr.respondJSON(204, {}, "");
            }

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