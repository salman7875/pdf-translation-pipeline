export type StructureT = {
  srNo: number;
  documentNo: string | null;
  dateOfExecution: string[];
  nature: string | null;
  executant: string[];
  claimant: string[];
  volNo: string | null;
  considerationValue: string | null;
  marketValue: string | null;
  prNumber: string | null;
  documentRemarks: string | null;
  propertyType: string | null;
  propertyExtent: string | null;
  villageAndStreet: string | null;
  surveyNo: string[];
  plotNo: string | null;
  boundaryDetails: string | null;
  scheduleRemarks: string | null;
};

export const createStructure = (payload: StructureT) => {
  return {
    "Sr.No": payload.srNo,
    "Document No.& Year": payload.documentNo,
    "Date of Execution & Date of Presentation & Date of Registration":
      payload.dateOfExecution,
    Nature: payload.nature,
    "Name of Executant(s)": payload.executant,
    "Name of Claimant(s)": payload.claimant,
    "Vol.No & Page.No": payload.volNo,
    "Consideration Value": payload.considerationValue,
    "Market Value": payload.marketValue,
    "PR Number": payload.prNumber,
    "Document Remarks": payload.documentRemarks,
    "Property Type": payload.propertyType,
    "Property Extent": payload.propertyExtent,
    "Village & Street": payload.villageAndStreet,
    "Survey No": payload.surveyNo,
    "Plot No": payload.plotNo,
    "Boundary Details": payload.boundaryDetails,
    "Schedule Remarks": payload.scheduleRemarks,
  };
};
