const {
  PageStates,
  getPageState,
  getProduct,
  getNotificationsForStateChange
} = require("./index");

const util = require("util");
const fs = require("fs");
const readFile = util.promisify(fs.readFile);

const readFixture = path => readFile(`./fixtures/${path}`, "utf8");

describe("snooze-supply", () => {
  describe("getPageState", () => {
    const testPageState = async (path, expectedState) =>
      expect(
        await getPageState({
          body: await readFixture(path)
        })
      ).toEqual(expectedState);

    it("should get the powerphase page state", async () => {
      await testPageState(
        "ys-powerphase-black-available-2018-03-17T13:00:18.454Z.html",
        PageStates.AVAILABLE
      );
      await testPageState(
        "ys-powerphase-black-season6-sold-out-2018-03-19T14:20:34.753Z.html",
        PageStates.UNKNOWN
      );
      await testPageState(
        "ys-powerphase-black-sold-out-2018-03-17T13:00:10.600Z.html",
        PageStates.SOLD_OUT
      );
      await testPageState(
        "ys-powerphase-black-today-2018-03-17T11:04:39.243Z.html",
        PageStates.TODAY
      );
      await testPageState(
        "ys-powerphase-black-tomorrow-2018-03-17T05:44:39.811Z.html",
        PageStates.TOMORROW
      );
      await testPageState(
        "ys-powerphase-black-wtf-empty-2018-03-17T13:00:10.600Z.html",
        PageStates.SOLD_OUT
      );
    });

    it("should get the 500 page state", async () => {
      await testPageState(
        "ys-500-blush-tomorrow-2018-04-13T15:36:41.036Z.html",
        PageStates.TOMORROW
      );
    });
  });

  describe("getProduct", () => {
    it("should get powerphase", async () => {
      expect(
        await getProduct({
          body: await readFixture(
            "ys-powerphase-black-tomorrow-2018-03-17T05:44:39.811Z.html"
          )
        })
      ).toEqual({
        description: "CORE BLACK",
        image:
          "https://cdn.shopify.com/s/files/1/1765/5971/products/PP_BLACK_yeezysupply_41a62345-766a-46e7-af18-acaad95328ed_950x.jpg?v=1521208039",
        title: "YEEZY POWERPHASE"
      });
    });

    it("should get 500s", async () => {
      expect(
        await getProduct({
          body: await readFixture(
            "ys-500-blush-tomorrow-2018-04-13T15:36:41.036Z.html"
          )
        })
      ).toEqual({
        description: "BLUSH",
        image:
          "https://cdn.shopify.com/s/files/1/1765/5971/products/01_d940c4e0-db02-4fed-b15b-90b3fee154c4_950x.jpg?v=1518722706",
        title: "YEEZY 500"
      });
    });

    it("should handle wtf product", async () => {
      expect(
        await getProduct({
          body: await readFixture(
            "ys-powerphase-black-wtf-empty-2018-03-17T13:00:10.600Z.html"
          )
        })
      ).toEqual({
        description: "",
        image: null,
        title: ""
      });
    });

    it("should handle season 6 page", async () => {
      expect(
        await getProduct({
          body: await readFixture(
            "ys-powerphase-black-season6-sold-out-2018-03-19T14:20:34.753Z.html"
          )
        })
      ).toEqual({
        description: "",
        image: null,
        title: ""
      });
    });
  });

  describe("getNotificationsForStateChange", () => {
    const product = {
      description: "CORE BLACK",
      image:
        "https://cdn.shopify.com/s/files/1/1765/5971/products/PP_BLACK_yeezysupply_41a62345-766a-46e7-af18-acaad95328ed_950x.jpg?v=1521208039",
      title: "YEEZY POWERPHASE"
    };

    it("should alert password page", async () => {
      expect(
        await getNotificationsForStateChange(
          product,
          PageStates.SOLD_OUT,
          PageStates.PASSWORD
        )
      ).toEqual([
        {
          body: "Yeezy supply password page is up.",
          level: 1,
          method: "message"
        }
      ]);
    });

    it("should alert AVAILABLE", async () => {
      expect(
        await getNotificationsForStateChange(
          product,
          PageStates.SOLD_OUT,
          PageStates.AVAILABLE
        )
      ).toEqual([
        {
          body: "Available! YEEZY POWERPHASE CORE BLACK is available on Yeezy Supply.",
          level: 2,
          method: "call"
        },
        {
          body:
            "Available! YEEZY POWERPHASE CORE BLACK is available on Yeezy Supply. https://yeezysupply.com/",
          level: 1,
          method: "message"
        }
      ]);
    });

    it("should alert SOLD_OUT", async () => {
      expect(
        await getNotificationsForStateChange(
          product,
          PageStates.AVAILABLE,
          PageStates.SOLD_OUT
        )
      ).toEqual([
        {
          body: "Sold out. YEEZY POWERPHASE CORE BLACK is is sold out on Yeezy Supply.",
          level: 1,
          method: "message"
        }
      ]);
    });

    it("should alert TOMORROW", async () => {
      expect(
        await getNotificationsForStateChange(
          product,
          PageStates.AVAILABLE,
          PageStates.TOMORROW
        )
      ).toEqual([
        {
          body:
            "Yeezy Supply updated. YEEZY POWERPHASE CORE BLACK available sometime tomorrow.",
          level: 1,
          method: "message"
        }
      ]);
    });

    it("should alert TODAY", async () => {
      expect(
        await getNotificationsForStateChange(
          product,
          PageStates.AVAILABLE,
          PageStates.TODAY
        )
      ).toEqual([
        {
          body:
            "Yeezy Supply updated. YEEZY POWERPHASE CORE BLACK available sometime today.",
          level: 1,
          method: "message"
        }
      ]);
    });

    it("should alert UNKNOWN", async () => {
      expect(
        await getNotificationsForStateChange(
          product,
          PageStates.AVAILABLE,
          PageStates.UNKNOWN
        )
      ).toEqual([
        {
          body:
            "Yeezy Supply is in an unknown state. YEEZY POWERPHASE CORE BLACK. https://yeezysupply.com",
          level: 3,
          method: "message"
        }
      ]);
    });
  });
});
