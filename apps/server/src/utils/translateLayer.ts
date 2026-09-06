import type { StructureT } from "./structureDTO.js";
import { translateTamilToEnglish } from "./translate.js";

export const translateLayer = async <T extends StructureT>(
  data: StructureT[],
): Promise<StructureT[]> => {
  return Promise.all(
    data.map(async (d: StructureT) => {
      return {
        ...d,
        scheduleRemarks: await translateTamilToEnglish(d.scheduleRemarks ?? ""),
        boundaryDetails: await translateTamilToEnglish(d.boundaryDetails ?? ""),
      };
    }),
  );
};
