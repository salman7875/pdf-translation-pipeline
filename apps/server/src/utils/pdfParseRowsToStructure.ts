import { createStructure, type StructureT } from "./structureDTO.js";

const cleanText = (text: string | null | undefined): string => {
  if (!text) return "";
  return text.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
};

export const parsePdfRowsToStructure = (rawRows: string[][]) => {
  const records: any[] = [];
  let currentRecord: any = null;

  let activeSection: "NONE" | "BOUNDARY_SCHEDULE" | "VALUES" = "NONE";

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || row.length === 0) continue;

    const fullRowText = row.map((cell) => cleanText(cell)).join(" ");
    const firstCol: any = row[0]?.trim();

    if (/^\d+$/.test(firstCol) && row.length >= 6) {
      if (currentRecord) {
        records.push(currentRecord);
      }

      const execs = row[4]
        ? row[4]
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      const claimants = row[5]
        ? row[5]
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const payload: StructureT = {
        srNo: parseInt(firstCol, 10),
        documentNo: cleanText(row[1]),
        dateOfExecution: row[2]
          ? row[2]
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        nature: cleanText(row[3]),
        executant: execs,
        claimant: claimants,
        volNo: row[6] && row[6].trim() !== "-" ? cleanText(row[6]) : "-",
        considerationValue: "",
        marketValue: "",
        propertyType: "",
        prNumber: "",
        propertyExtent: "",
        documentRemarks: "",
        plotNo: "",
        surveyNo: [],
        villageAndStreet: "",
        boundaryDetails: "",
        scheduleRemarks: "",
      };

      currentRecord = createStructure(payload);
      activeSection = "NONE";
      continue;
    }

    if (!currentRecord) continue;

    if (
      fullRowText.includes("Consideration Value") ||
      fullRowText.includes("Market Value") ||
      fullRowText.includes("PR Number") ||
      activeSection === "VALUES"
    ) {
      const rupeeMatches: any =
        fullRowText.match(/ரூ\.\s*[\d,]+(?:\/-)?/g) ||
        fullRowText.match(/Rs\.\s*[\d,]+/g);

      if (rupeeMatches && rupeeMatches.length > 0) {
        if (!currentRecord["Consideration Value"]) {
          currentRecord["Consideration Value"] = rupeeMatches[0].trim();
        }
        if (rupeeMatches.length >= 2 && !currentRecord["Market Value"]) {
          currentRecord["Market Value"] = rupeeMatches[1].trim();
        } else if (!currentRecord["Market Value"]) {
          currentRecord["Market Value"] = rupeeMatches[0].trim();
        }
      }

      const prMatch = fullRowText.match(
        /\b\d{1,5}\s*\/\s*\d{4}(?:\s*,\s*\d{1,5}\s*\/\s*\d{4})*\b/,
      );

      if (prMatch) {
        currentRecord["PR Number"] = prMatch[0].trim();
      }

      if (
        !rupeeMatches &&
        !prMatch &&
        fullRowText.includes("Consideration Value")
      ) {
        activeSection = "VALUES";
        continue;
      } else {
        activeSection = "NONE";
      }
    }

    if (
      fullRowText.includes("Document Remarks") ||
      fullRowText.includes("ஆவணக் குறிப்புகள்")
    ) {
      const remarkText = fullRowText
        .replace(/Document Remarks\/|\bஆவணக் குறிப்புகள்\s*:/gi, "")
        .trim();
      if (remarkText) {
        currentRecord["Document Remarks"] = cleanText(
          (currentRecord["Document Remarks"] || "") + " " + remarkText,
        );
      }
    }

    if (
      fullRowText.includes("Property Type") ||
      fullRowText.includes("Property Extent") ||
      fullRowText.includes("வகைப்பாடு")
    ) {
      const typeMatch = fullRowText.match(
        /Property Type\/ெசாத்தின்\s*வ\s*ைகப்பா\s*டு\s*:\s*(.*?)(?=\s*Property Extent|$)/i,
      );
      if (typeMatch && typeMatch[1]) {
        currentRecord["Property Type"] = cleanText(typeMatch[1]);
      }

      const extentMatch = fullRowText.match(
        /Property Extent\/ெசாத்தின்\s*விஸ்தீ?\s*ர்\s*ணம்\s*:\s*(.*?)(?=\s*\d+$|$)/i,
      );
      if (extentMatch && extentMatch[1]) {
        currentRecord["Property Extent"] = cleanText(extentMatch[1]);
      }
    }

    if (
      fullRowText.includes("Village & Street") ||
      fullRowText.includes("Survey No")
    ) {
      const villageMatch = fullRowText.match(
        /Village[^\n:]*:\s*([\s\S]*?)(?=(?:Survey No\.|புல எண்))/i,
      );

      if (villageMatch && villageMatch[1]) {
        currentRecord["Village & Street"] = cleanText(villageMatch[1]);
      }

      const surveyMatch = fullRowText.match(
        /(?:Survey No\.|புல எண்)\s*:\s*([^\r\n]+)/i,
      );
      if (surveyMatch && surveyMatch[1]) {
        const surveys = surveyMatch[1]
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        currentRecord["Survey No"] = surveys;
      }
    }

    if (fullRowText.includes("Plot No") || fullRowText.includes("மனை எண்")) {
      const plotMatch = fullRowText.match(
        /(?:Plot No\.|மைன எண்)\s*:?\s*(\d+)/i,
      );

      if (plotMatch && plotMatch[1]) {
        currentRecord["Plot No"] = plotMatch[1].trim();
      }
    }

    if (
      fullRowText.includes("எல்லை விபரங்கள்") ||
      fullRowText.includes("Schedule Remarks") ||
      activeSection === "BOUNDARY_SCHEDULE"
    ) {
      activeSection = "BOUNDARY_SCHEDULE";

      for (const cell of row) {
        const cleanedCell = cleanText(cell);
        if (!cleanedCell) continue;

        if (
          cleanedCell.includes("Schedule 1 Details") ||
          cleanedCell.includes("Property Type") ||
          cleanedCell.includes("Plot No.")
        ) {
          continue;
        }

        if (
          cleanedCell.includes("எல்லை விபரங்கள்") ||
          cleanedCell.includes("தெருவுக்கும்") ||
          cleanedCell.includes("வடக்கு") ||
          cleanedCell.includes("தெற்கு") ||
          cleanedCell.includes("கிழக்கு") ||
          cleanedCell.includes("மேற்கு")
        ) {
          const textOnly = cleanedCell.replace("எல்லை விபரங்கள் :", "").trim();
          currentRecord["Boundary Details"] = cleanText(
            (currentRecord["Boundary Details"] || "") + " " + textOnly,
          );
        } else if (
          cleanedCell.includes("Schedule Remarks") ||
          cleanedCell.includes("சொத்து விவரம்") ||
          cleanedCell.includes("சர்வே எண்") ||
          cleanedCell.includes("அயன் புஞ்சை") ||
          cleanedCell.includes("ஹெக்")
        ) {
          const textOnly = cleanedCell
            .replace(/Schedule Remarks\/[^:]*:/gi, "")
            .trim();
          currentRecord["Schedule Remarks"] = cleanText(
            (currentRecord["Schedule Remarks"] || "") + " " + textOnly,
          );
        } else {
          if (row.indexOf(cell) === 0) {
            currentRecord["Boundary Details"] = cleanText(
              (currentRecord["Boundary Details"] || "") + " " + cleanedCell,
            );
          } else {
            currentRecord["Schedule Remarks"] = cleanText(
              (currentRecord["Schedule Remarks"] || "") + " " + cleanedCell,
            );
          }
        }
      }
    }
  }

  if (currentRecord) {
    records.push(currentRecord);
  }

  return records;
};
