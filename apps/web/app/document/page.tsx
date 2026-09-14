"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  Download,
  SplitSquareHorizontal,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize,
  FileText,
  Loader2,
  Trash2,
  Play,
} from "lucide-react";
import { DocumentRecord } from "./types/index.type";
import { DataField } from "./components/data-field";
import { DataSection } from "./components/data-section";
import {
  ApiDocumentWithTranslations,
  deleteDocument,
  getDocuments,
  processDocument,
} from "@/lib/api";

const emptyRecord = (
  document: ApiDocumentWithTranslations,
): DocumentRecord => ({
  "Sr.No": document.id,
  "Document No.& Year": document.documentUrl,
  "Date of Execution & Date of Presentation & Date of Registration": [],
  Nature: "Not processed",
  "Name of Executant(s)": [],
  "Name of Claimant(s)": [],
  "Vol.No & Page.No": "-",
  "Consideration Value": "-",
  "Market Value": "-",
  "PR Number": "-",
  "Document Remarks": "-",
  "Property Type": "-",
  "Property Extent": "-",
  "Village & Street": "-",
  "Survey No": [],
  "Plot No": "-",
  "Boundary Details": "-",
  "Schedule Remarks": "-",
});

const toRecord = (
  document: ApiDocumentWithTranslations,
  translation = document.translations?.[0],
): DocumentRecord => {
  if (!translation) return emptyRecord(document);

  return {
    ...emptyRecord(document),
    "Sr.No": Number(translation.srNo) || document.id,
    "Document No.& Year": translation.documentNo,
    "Date of Execution & Date of Presentation & Date of Registration":
      translation.dateOfExecution.split(" ").filter(Boolean),
    Nature: translation.nature,
    "Name of Executant(s)":
      translation.executants?.map((item) => item.name) ?? [],
    "Name of Claimant(s)":
      translation.claimants?.map((item) => item.name) ?? [],
    "Vol.No & Page.No": translation.volNo,
    "Consideration Value": translation.considerationValue,
    "Market Value": translation.marketValue,
    "PR Number": translation.prNumber,
    "Document Remarks": translation.documentRemarks,
    "Property Type": translation.propertyType,
    "Property Extent": translation.propertyExtent,
    "Plot No": translation.plotNo,
    "Survey No": translation.surveyNo.split(", ").filter(Boolean),
    "Boundary Details": translation.boundaryDetail,
    "Schedule Remarks": translation.scheduleRemarks,
  };
};

const rowsForDocument = (document: ApiDocumentWithTranslations) => {
  const translations = document.translations ?? [];
  return translations.length === 0
    ? [{ document, row: toRecord(document) }]
    : translations.map((translation) => ({
        document,
        row: toRecord(document, translation),
      }));
};

export default function DocumentRegistryPage() {
  const [documents, setDocuments] = useState<ApiDocumentWithTranslations[]>([]);
  const [filters, setFilters] = useState({
    buyerName: "",
    sellerName: "",
    houseNumber: "",
    surveyNumber: "",
    documentNumber: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comparingDoc, setComparingDoc] = useState<DocumentRecord | null>(null);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setDocuments(await getDocuments(filters));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load documents",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDocuments();
  }, [filters]);

  if (comparingDoc) {
    return (
      <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
        <div className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setComparingDoc(null)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Table
            </Button>
            <div className="h-4 w-px bg-border"></div>
            <h1 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Comparing Record: {comparingDoc["Document No.& Year"]}
            </h1>
          </div>
          <Button size="sm">Approve Validation</Button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/2 lg:w-[40%] border-r bg-background overflow-y-auto p-6 custom-scrollbar">
            <h2 className="text-lg font-bold mb-4">Extracted Data</h2>
            <div className="space-y-6">
              <DataSection title="Primary Details">
                <DataField
                  label="Document No. & Year"
                  value={comparingDoc["Document No.& Year"]}
                />
                <DataField label="Nature" value={comparingDoc.Nature} />
                <DataField
                  label="PR Number"
                  value={comparingDoc["PR Number"]}
                />
                <DataField
                  label="Registration Dates"
                  value={comparingDoc[
                    "Date of Execution & Date of Presentation & Date of Registration"
                  ].join(" | ")}
                />
              </DataSection>

              <DataSection title="Parties">
                <DataField
                  label="Executant(s)"
                  value={comparingDoc["Name of Executant(s)"].map((n, i) => (
                    <div key={i}>{n}</div>
                  ))}
                />
                <DataField
                  label="Claimant(s)"
                  value={comparingDoc["Name of Claimant(s)"].map((n, i) => (
                    <div key={i}>{n}</div>
                  ))}
                />
              </DataSection>

              <DataSection title="Valuation">
                <DataField
                  label="Consideration Value"
                  value={comparingDoc["Consideration Value"]}
                />
                <DataField
                  label="Market Value"
                  value={comparingDoc["Market Value"]}
                />
              </DataSection>

              <DataSection title="Property Details">
                <DataField
                  label="Type & Extent"
                  value={`${comparingDoc["Property Type"]} - ${comparingDoc["Property Extent"]}`}
                />
                <DataField
                  label="Location"
                  value={comparingDoc["Village & Street"]}
                />
                <DataField
                  label="Survey No"
                  value={comparingDoc["Survey No"].join(", ")}
                />
                <DataField label="Plot No" value={comparingDoc["Plot No"]} />
                <DataField
                  label="Boundary Details"
                  value={comparingDoc["Boundary Details"]}
                />
                <DataField
                  label="Schedule Remarks"
                  value={comparingDoc["Schedule Remarks"]}
                />
              </DataSection>
            </div>
          </div>

          <div className="flex-1 bg-slate-200/50 dark:bg-slate-900 flex flex-col">
            <div className="h-12 border-b bg-background/50 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
              <div className="text-xs font-medium text-muted-foreground">
                Page 1 of 4
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-xs font-medium px-2">100%</span>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-2"></div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 flex justify-center">
              <div className="bg-white dark:bg-slate-100 shadow-xl w-full max-w-2xl h-250 rounded-sm p-12 text-slate-900">
                <div className="border-b-2 border-slate-300 pb-4 mb-8 text-center">
                  <h3 className="font-bold text-xl uppercase tracking-widest">
                    Deed of Conveyance
                  </h3>
                  <p className="text-sm mt-2 text-slate-600">
                    Document No. {comparingDoc["Document No.& Year"]}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-4/5 mt-8"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                </div>
                <div className="mt-12 flex justify-center items-center h-64 border-2 border-dashed border-slate-300 text-slate-400">
                  [ Actual PDF Rendered Here via react-pdf / iframe ]
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Encumbrance & Registration Records
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Search, filter, and inspect registered property documents and legal
            entries.
          </p>
        </div>
      </div>

      <Card className="border bg-card shadow-xs">
        <CardHeader className="pb-4 border-b dark:border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold">
                Registered Documents
              </CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  ["documentNumber", "Document No."],
                  ["buyerName", "Buyer"],
                  ["sellerName", "Seller"],
                  ["houseNumber", "House No."],
                  ["surveyNumber", "Survey No."],
                ] as const
              ).map(([key, placeholder]) => (
                <div className="relative w-32" key={key}>
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <Input
                    placeholder={placeholder}
                    value={filters[key]}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                    className="pl-8 h-8 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <Table className="text-xs">
              <TableHeader className="bg-slate-100/60 dark:bg-slate-900/60">
                <TableRow>
                  <TableHead className="w-15 text-center">Sr.</TableHead>
                  <TableHead className="min-w-30">Doc No & Year</TableHead>
                  <TableHead className="min-w-37.5">Nature</TableHead>
                  <TableHead className="min-w-45">Executant(s)</TableHead>
                  <TableHead className="min-w-40">Property Details</TableHead>
                  <TableHead className="w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && error && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-destructive py-10"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && !error && documents.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-10"
                    >
                      No documents found.
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  !error &&
                  documents
                    .flatMap(rowsForDocument)
                    .map(({ document, row }) => {
                      return (
                        <TableRow
                          key={`${document.id}-${row["Sr.No"]}-${row["Document No.& Year"]}`}
                        >
                          <TableCell className="font-medium text-center">
                            {row["Sr.No"]}
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-foreground">
                              {row["Document No.& Year"]}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-normal mb-1"
                            >
                              {row.Nature}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 max-w-50">
                              {row["Name of Executant(s)"].map((name, i) => (
                                <div key={i} className="text-[11px] truncate">
                                  {name}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {row["Property Type"]}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {row["Property Extent"]}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-xs font-medium text-primary cursor-pointer"
                                  onClick={() => setComparingDoc(row)}
                                >
                                  <SplitSquareHorizontal className="w-3.5 h-3.5 mr-2" />{" "}
                                  Compare w/ PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-xs"
                                  onClick={async () => {
                                    await processDocument(document.id);
                                    await loadDocuments();
                                  }}
                                >
                                  <Play className="w-3.5 h-3.5 mr-2" /> Process
                                  document
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-xs"
                                  onClick={async () => {
                                    await deleteDocument(document.id);
                                    await loadDocuments();
                                  }}
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                                  document
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-xs">
                                  <Download className="w-3.5 h-3.5 mr-2" />{" "}
                                  Download Record
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
