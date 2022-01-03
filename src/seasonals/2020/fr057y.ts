import { Year2020SeasonalGroup, Year2020SeasonalPOBType } from "./_index";

export const fr057yGroup = new Year2020SeasonalGroup({
  name: "Fr057y",
  starts: "2020-12-01T00:00:00-05:00",
  ends: "3020-12-31T23:59:00-05:00",
});

// TODO: Move to MechZ
export const fr057y = new Year2020SeasonalPOBType("Fr057y", 2743).addGroup(fr057yGroup);
