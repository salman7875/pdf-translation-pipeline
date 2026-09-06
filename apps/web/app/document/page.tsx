"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Eye,
  Download,
  Calendar,
  MapPin,
} from "lucide-react";
import { sampleData } from "./data";

export default function DocumentRegistryPage() {
  const [selectedNature, setSelectedNature] = useState<string>("all");

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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Records
          </Button>
        </div>
      </div>

      <Card className="border bg-card shadow-xs">
        <CardHeader className="pb-4 border-b dark:border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold">
                Registered Documents
              </CardTitle>
              <CardDescription className="text-xs">
                Showing entries registered under target survey boundaries.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Search Doc No, Executant..."
                  className="pl-8 h-8 text-xs"
                />
              </div>

              <Select
                value={selectedNature}
                onValueChange={(value) => setSelectedNature(value ?? "all")}
              >
                <SelectTrigger className="h-8 text-xs w-40">
                  <Filter className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                  <SelectValue placeholder="Nature of Doc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Natures</SelectItem>
                  <SelectItem value="conveyance">
                    Conveyance Non Metro/UA
                  </SelectItem>
                  <SelectItem value="mortgage">Mortgage</SelectItem>
                  <SelectItem value="lease">Lease Agreement</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="h-8 text-xs w-32.5">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="house-site">House Site</SelectItem>
                  <SelectItem value="agricultural">Agricultural</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <Table className="text-xs">
              <TableHeader className="bg-slate-100/60 dark:bg-slate-900/60">
                <TableRow>
                  <TableHead className="w-15 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 p-0 font-semibold text-xs"
                    >
                      Sr. <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-30">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 p-0 font-semibold text-xs"
                    >
                      Doc No & Year <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-35">
                    Dates (Exec/Pres/Reg)
                  </TableHead>
                  <TableHead className="min-w-37.5">Nature & Value</TableHead>
                  <TableHead className="min-w-45">Executant(s)</TableHead>
                  <TableHead className="min-w-37.5">Claimant(s)</TableHead>
                  <TableHead className="min-w-40">Property Details</TableHead>
                  <TableHead className="min-w-25">Survey & Plot</TableHead>
                  <TableHead className="min-w-50">Remarks</TableHead>
                  <TableHead className="w-12.5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleData.map((row) => (
                  <TableRow
                    key={row["Sr.No"]}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40"
                  >
                    <TableCell className="font-medium text-center">
                      {row["Sr.No"]}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground">
                        {row["Document No.& Year"]}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        PR: {row["PR Number"]}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span>
                            {
                              row[
                                "Date of Execution & Date of Presentation & Date of Registration"
                              ][0]
                            }
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-normal mb-1"
                      >
                        {row.Nature}
                      </Badge>
                      <div className="text-[11px] font-medium text-foreground">
                        {row["Consideration Value"]}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 max-w-50">
                        {row["Name of Executant(s)"].map((name, i) => (
                          <div
                            key={i}
                            className="text-[11px] leading-tight text-foreground/90"
                          >
                            {name}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {row["Name of Claimant(s)"].map((claimant, i) => (
                          <div
                            key={i}
                            className="text-[11px] leading-tight text-foreground/90"
                          >
                            {claimant}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="font-medium text-foreground">
                          {row["Property Type"]}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {row["Property Extent"]}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">
                            {row["Village & Street"]}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-[11px]">
                          <span className="font-medium">Plot:</span>{" "}
                          {row["Plot No"]}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {row["Survey No"].map((sNo) => (
                            <Badge
                              key={sNo}
                              variant="secondary"
                              className="text-[9px] px-1 py-0"
                            >
                              {sNo}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-60 space-y-1">
                        <p className="text-[11px] line-clamp-2 text-foreground/80">
                          {row["Document Remarks"]}
                        </p>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">
                          {row["Boundary Details"]}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-xs">
                            <Eye className="w-3.5 h-3.5 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs">
                            <Download className="w-3.5 h-3.5 mr-2" /> Download
                            Record
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t dark:border-slate-800">
            <div className="flex items-center text-xs text-muted-foreground gap-2">
              <span>Rows per page</span>
              <Select defaultValue="10">
                <SelectTrigger className="h-7 w-16.25 text-xs">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="hidden sm:inline-block ml-2">
                Showing 1-1 of 1 entries
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground mr-2">
                Page 1 of 1
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
