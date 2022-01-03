import {
  Year2021SeasonalBouncerType,
  Year2021SeasonalScatterType,
  Year2021SeasonalGroup,
} from "./_index";
import { TypeHidden } from "../../common/type";

export const lotterZEEGroup = new Year2021SeasonalGroup({
  name: "LotterZEE",
  starts: "2021-08-26T12:00:00-05:00",
  ends: "2021-09-23T23:59:00-05:00",
});

export const physicalLotterZEEBallMachine = new Year2021SeasonalBouncerType(
  "Physical LotterZEE Ball Machine"
).addGroup(lotterZEEGroup);
export const virtualLotterZEEBallMachine = new Year2021SeasonalBouncerType(
  "Virtual LotterZEE Ball Machine"
).addGroup(lotterZEEGroup);
export const lotterZEEBall1 = new Year2021SeasonalScatterType("LotterZEE Ball 1")
  .addGroup(lotterZEEGroup)
  .standalone()
  .addHidden(TypeHidden.Bouncers);
export const lotterZEEBall2 = new Year2021SeasonalScatterType("LotterZEE Ball 2")
  .addGroup(lotterZEEGroup)
  .standalone()
  .addHidden(TypeHidden.Bouncers);
export const lotterZEEBall3 = new Year2021SeasonalScatterType("LotterZEE Ball 3")
  .addGroup(lotterZEEGroup)
  .standalone()
  .addHidden(TypeHidden.Bouncers);
export const lotterZEEBall4 = new Year2021SeasonalScatterType("LotterZEE Ball 4")
  .addGroup(lotterZEEGroup)
  .standalone()
  .addHidden(TypeHidden.Bouncers);
export const lotterZEEBall5 = new Year2021SeasonalScatterType("LotterZEE Ball 5")
  .addGroup(lotterZEEGroup)
  .standalone()
  .addHidden(TypeHidden.Bouncers);
export const lotterZEEBall6 = new Year2021SeasonalScatterType("LotterZEE Ball 6")
  .addGroup(lotterZEEGroup)
  .standalone()
  .addHidden(TypeHidden.Bouncers);
export const lotterZEEBall7 = new Year2021SeasonalScatterType("LotterZEE Ball 7")
  .addGroup(lotterZEEGroup)
  .standalone()
  .addHidden(TypeHidden.Bouncers);
export const lotterZEEBall8 = new Year2021SeasonalScatterType("LotterZEE Ball 8")
  .addGroup(lotterZEEGroup)
  .standalone()
  .addHidden(TypeHidden.Bouncers);
export const lotterZEEBall9 = new Year2021SeasonalScatterType("LotterZEE Ball 9")
  .addGroup(lotterZEEGroup)
  .standalone()
  .addHidden(TypeHidden.Bouncers);
