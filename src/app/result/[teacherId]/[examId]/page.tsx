"use client";
import { IExam } from "@/models/exam";
import React, { useEffect, useState } from "react";
import { fetchExamById } from "../../../../action/fetch-exam-by-id";
import { useParams } from "next/navigation";
import { fetchResultByTeacherIdExamId } from "../../../../action/res/fetch-result-by-teacherId-examId";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  CalendarIcon,
  ChevronDown,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "sonner";
import { TopNavigationBar } from "@/components/top-navigation-bar";
import { Footer } from "@/components/footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentAnswer } from "@/models/students-response";
import { fetchStudentById } from "@/action/student/fetch-student-by-id";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FaSortNumericUp, FaSortNumericDown } from "react-icons/fa";
import { BiSortAlt2 } from "react-icons/bi";
import { splitQuestionBySpecialTag } from "@/lib/message-parser";
import MathBlock from "@/components/math-block";

type IResponses = {
  responses: StudentAnswer[];
  scored: number;
  submittedAt: Date;
};

type FormattedResultData = {
  studentName?: string;
  studentEmail?: string;
  studentAvatar?: string;
  studentId: string;
  responses: IResponses[];
};

type SortState = "disabled" | "increased" | "decreased";

const Page = () => {
  const { teacherId, examId } = useParams() as {
    teacherId: string;
    examId: string;
  };
  const [examData, setExamData] = useState<IExam>();
  const [formattedResultData, setFormattedResultData] = useState<
    FormattedResultData[]
  >([]);
  const [selectedStudent, setSelectedStudent] =
    useState<FormattedResultData | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [expandedScoreIndex, setExpandedScoreIndex] = useState<number | null>(
    null
  );
  const [searchByStudentName, setSearchByStudentName] = useState<string>("");
  const [searchbyStudentEmail, setSearchbyStudentEmail] = useState<string>("");

  const [allstudentResponses, setAllSetstudentResponses] = useState<
    FormattedResultData[] | undefined
  >();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const [sortByScore, setSortByScore] = useState<SortState>("disabled");

  // Reset search and date when the component mounts
  useEffect(() => {
    setSearchByStudentName("");
    setSearchbyStudentEmail("");
    setSelectedDate(undefined);
  }, []);

  // Fetch exam data and student responses when teacherId or examId changes
  useEffect(() => {
    async function getExamResponseData() {
      try {
        const examDataResponse = await fetchExamById({ teacherId, examId });
        if (examDataResponse.success) {
          setExamData(examDataResponse.data);
        } else {
          console.log("error: ", examDataResponse.message);
          toast.error("Error fetching exam data: " + examDataResponse.message);
        }

        // fetching all students responses by teacher and exam ID
        const studentsResponseDatas = await fetchResultByTeacherIdExamId({
          teacherId,
          examId,
        });

        if (!studentsResponseDatas.success) {
          console.log("error: ", studentsResponseDatas.message);
          toast.error(
            "Error fetching student results: " + studentsResponseDatas.message
          );
          return; // Exit early if there's an error
        }

        // grouping student responses by student ID
        const grouped: Record<string, FormattedResultData> = {};

        // Check if data exists and process it
        if (
          studentsResponseDatas.data &&
          studentsResponseDatas.data.length > 0
        ) {
          studentsResponseDatas.data.forEach((curr) => {
            // Access nested student info from the MongoDB projection
            const studentInfo = curr.studentInfo || {};

            if (grouped[curr.studentId]) {
              grouped[curr.studentId].responses.push({
                responses: curr.responses,
                scored: curr.scored,
                submittedAt: curr.createdAt,
              });
            } else {
              console.log("studentInfo: ", studentInfo);
              console.log("curr object: ", curr); // Add this to see the full object

              grouped[curr.studentId] = {
                studentName: studentInfo?.name || curr.studentName || "Unknown", // Fallback to curr.studentName if exists
                studentEmail: studentInfo?.email || curr.studentEmail || "",
                studentAvatar: studentInfo?.avatar || curr.studentAvatar || "",
                studentId: curr.studentId,
                responses: [
                  {
                    responses: curr.responses,
                    scored: curr.scored,
                    submittedAt: curr.createdAt,
                  },
                ],
              };
            }
          });
        }

        // Convert the grouped object into an array
        const formattedDataArray: FormattedResultData[] =
          Object.values(grouped);
        setFormattedResultData(formattedDataArray);
        setAllSetstudentResponses(formattedDataArray);
        console.log("Formatted Result Data: ", formattedDataArray);
      } catch (error) {
        console.log("error: ", error);
        console.error("Error fetching exam data:", error);
        toast.error("Error fetching exam data: " + error);
      }
    }

    if (teacherId && examId) {
      getExamResponseData();
    }
  }, [teacherId, examId]);

  //searching and filtering logic
  useEffect(() => {
    console.log("Applying search and date filters...");
    if (!selectedDate) {
      console.log("No date selected, applying search filters only.");
      handleSortByScore(sortByScore);
      applySearchFilters();
      return;
    }
    console.log("KUTTA");
    let dataToFilter = allstudentResponses || [];

    const dateFilteredData = dataToFilter.filter((item) => {
      if (!item.responses || item.responses.length === 0) return false;

      const submissionDate = new Date(item.responses[0].submittedAt);
      return (
        submissionDate.getDate() === selectedDate.getDate() &&
        submissionDate.getMonth() === selectedDate.getMonth() &&
        submissionDate.getFullYear() === selectedDate.getFullYear()
      );
    });

    let finalFilteredData = [...dateFilteredData];

    console.log("KUTTA");

    if (searchByStudentName?.trim()) {
      finalFilteredData = finalFilteredData.filter((item) =>
        item?.studentName
          ?.toLowerCase()
          .includes(searchByStudentName.toLowerCase().trim())
      );
    }

    if (searchbyStudentEmail?.trim()) {
      finalFilteredData = finalFilteredData.filter((item) =>
        item?.studentEmail
          ?.toLowerCase()
          .includes(searchbyStudentEmail.toLowerCase().trim())
      );
    }

    console.log("Final filtered data length: ", finalFilteredData.length);

    if (sortByScore === "increased") {
      console.log("yppp one");
      finalFilteredData = finalFilteredData.slice().sort((a, b) => {
        const scoreA =
          a.responses.length > 0
            ? a.responses[a.responses.length - 1].scored
            : 0;
        const scoreB =
          b.responses.length > 0
            ? b.responses[b.responses.length - 1].scored
            : 0;
        return scoreA - scoreB;
      });
    }

    if (sortByScore === "decreased") {
      console.log("yppp two");
      finalFilteredData = finalFilteredData.slice().sort((a, b) => {
        const scoreA =
          a.responses.length > 0
            ? a.responses[a.responses.length - 1].scored
            : 0;
        const scoreB =
          b.responses.length > 0
            ? b.responses[b.responses.length - 1].scored
            : 0;
        return scoreB - scoreA;
      });
    }

    if (sortByScore === "disabled") {
      console.log("yppp three");
      finalFilteredData = finalFilteredData.slice().sort((a, b) => {
        const dateA =
          a.responses.length > 0
            ? new Date(
                a.responses[a.responses.length - 1].submittedAt
              ).getTime()
            : 0;
        const dateB =
          b.responses.length > 0
            ? new Date(
                b.responses[b.responses.length - 1].submittedAt
              ).getTime()
            : 0;
        return dateB - dateA;
      });
    }

    console.log(`Date filter: ${selectedDate.toDateString()}`);
    console.log(`Results after date filter: ${dateFilteredData.length}`);
    console.log(`Results after search filters: ${finalFilteredData.length}`);

    setFormattedResultData(finalFilteredData);
  }, [
    selectedDate,
    allstudentResponses,
    searchByStudentName,
    searchbyStudentEmail,
    sortByScore,
  ]);

  // Helper function to apply search filters without date filter
  const applySearchFilters = () => {
    if (!searchByStudentName && !searchbyStudentEmail) {
      console.log("Applying search filters.******");
      setFormattedResultData(allstudentResponses || []);
      return;
    }

    let filteredData = [...(allstudentResponses || [])];

    if (searchByStudentName && searchByStudentName.trim()) {
      filteredData = filteredData.filter((item) =>
        item?.studentName
          ?.toLowerCase()
          .includes(searchByStudentName.toLowerCase().trim())
      );
    }

    if (searchbyStudentEmail && searchbyStudentEmail.trim()) {
      filteredData = filteredData.filter((item) =>
        item?.studentEmail
          ?.toLowerCase()
          .includes(searchbyStudentEmail.toLowerCase().trim())
      );
    }

    console.log(" HUMMA HUMMA A KJHBKJG");

    setFormattedResultData(filteredData);
  };

  const handleSortByScore = (sortByScore: SortState) => {
    let filteredData = [...(allstudentResponses || [])];

    if (sortByScore === "increased") {
      console.log("yppp one");
      filteredData = filteredData.slice().sort((a, b) => {
        const scoreA =
          a.responses.length > 0
            ? a.responses[a.responses.length - 1].scored
            : 0;
        const scoreB =
          b.responses.length > 0
            ? b.responses[b.responses.length - 1].scored
            : 0;
        return scoreA - scoreB;
      });
    }

    if (sortByScore === "decreased") {
      console.log("yppp two");
      filteredData = filteredData.slice().sort((a, b) => {
        const scoreA =
          a.responses.length > 0
            ? a.responses[a.responses.length - 1].scored
            : 0;
        const scoreB =
          b.responses.length > 0
            ? b.responses[b.responses.length - 1].scored
            : 0;
        return scoreB - scoreA;
      });
    }

    if (sortByScore === "disabled") {
      console.log("yppp three");
      filteredData = filteredData.slice().sort((a, b) => {
        const dateA =
          a.responses.length > 0
            ? new Date(
                a.responses[a.responses.length - 1].submittedAt
              ).getTime()
            : 0;
        const dateB =
          b.responses.length > 0
            ? new Date(
                b.responses[b.responses.length - 1].submittedAt
              ).getTime()
            : 0;
        return dateB - dateA;
      });
    }

    setFormattedResultData(filteredData);
  };

  const sortedScoresByDate: IResponses[] = selectedDate
    ? selectedStudent?.responses?.filter(
        (item) =>
          item.submittedAt.getDate() === selectedDate.getDate() &&
          item.submittedAt.getMonth() === selectedDate.getMonth() &&
          item.submittedAt.getFullYear() === selectedDate.getFullYear()
      ) ?? []
    : selectedStudent?.responses?.sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      ) ?? [];

  // Search by student name or email
  const handleSearchStudent = (searchValue: string) => {
    setSearchByStudentName(searchValue);
    setSearchbyStudentEmail(searchValue);
  };

  // Handle date selection from calendar
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setCalendarOpen(false);
    console.log("Date selected: ", date);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopNavigationBar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Results: {examData?.name}
            </h2>
            <div className=" flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchByStudentName("");
                  setSearchbyStudentEmail("");
                  setSelectedDate(undefined);
                  setFormattedResultData(allstudentResponses || []);
                }}
                className="text-md active:bg-gray-200 duration-100 ease-in transition-all hover:bg-gray-200 hover:text-gray-800"
              >
                <RefreshCcw className="text-gray-500 text-lg" />
              </Button>
              <Input
                placeholder="Search by student name or email"
                className="w-72 border-b-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                value={searchByStudentName || searchbyStudentEmail}
                onChange={(e) => handleSearchStudent(e.target.value)}
                type="text"
              />
              <div className="space-y-2">
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      type="button"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate && (
                        <Label className="text-sm text-gray-600">
                          {format(selectedDate, "MMM d, yyyy")}
                        </Label>
                      )}

                      <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date > today;
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {sortByScore === "disabled" && (
                <Button
                  variant="outline"
                  className="text-md opacity-50"
                  onClick={() => setSortByScore("increased")}
                >
                  disable
                  <BiSortAlt2 />
                </Button>
              )}
              {sortByScore === "increased" && (
                <Button
                  variant="outline"
                  className="text-md text-blue-600"
                  onClick={() => setSortByScore("decreased")}
                >
                  Increase
                  <FaSortNumericUp />
                </Button>
              )}
              {sortByScore === "decreased" && (
                <Button
                  variant="outline"
                  className="text-md text-blue-600"
                  onClick={() => setSortByScore("disabled")}
                >
                  Decrease
                  <FaSortNumericDown />
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Image</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Latest Score</TableHead>
                  <TableHead>Last Submission</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formattedResultData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No results found. Try Removing the search filters.
                    </TableCell>
                  </TableRow>
                )}
                {formattedResultData?.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell className="flex items-center gap-1">
                      <Image
                        src={result.studentAvatar || ""}
                        alt="Student Avatar"
                        width={100}
                        height={100}
                        className="rounded-full p-[2px] border h-16 w-16 border-gray-300 mr-4"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {result.studentName}
                    </TableCell>
                    <TableCell>{result.studentEmail}</TableCell>
                    <TableCell>
                      {result.responses.length > 0
                        ? result.responses[result.responses.length - 1].scored
                        : "No scores"}
                    </TableCell>
                    <TableCell>
                      {result.responses?.length > 0
                        ? format(
                            result.responses[result.responses.length - 1]
                              .submittedAt,
                            "MMM d, yyyy - h:mm a"
                          )
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedStudent(result);
                          setShowDialog(true);
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <Footer />

      {/* Dialog for Student Details */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Student Details</DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6">
              <div className=" w-full flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <Image
                      src={selectedStudent?.studentAvatar || ""}
                      alt="Student Avatar"
                      width={100}
                      height={100}
                      className="rounded-full p-1 border border-gray-300 mr-4"
                    />
                    <div className=" flex flex-col gap-[2px]">
                      <p className="text-lg font-semibold text-gray-800">
                        {selectedStudent.studentName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedStudent.studentEmail}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between"></div>
              </div>

              {sortedScoresByDate?.map((score, index) => {
                const isExpanded = expandedScoreIndex === index;

                return (
                  <div key={index} className="border rounded-md p-4 ">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() =>
                        setExpandedScoreIndex(
                          isExpanded ? null : index // collapse if clicked again
                        )
                      }
                    >
                      <div>
                        <p className="text-base font-medium text-gray-700">
                          Scored: {score.scored}
                        </p>
                        <p className="text-sm text-gray-500">
                          Submitted at:{" "}
                          {format(score.submittedAt, "dd/MM/yyyy HH:mm:ss")}
                        </p>
                      </div>
                      <button className="text-blue-600 text-sm underline">
                        {isExpanded ? "Hide Details" : "Show Details"}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 overflow-x-auto border rounded-lg">
                        <table className="min-w-full text-sm table-auto">
                          <thead className="bg-gray-100 text-gray-700">
                            <tr>
                              <th className="px-4 py-2 text-left">Question</th>
                              <th className="px-4 py-2 text-left">Selected</th>
                              <th className="px-4 py-2 text-left">Correct</th>
                            </tr>
                          </thead>
                          <tbody>
                            {score.responses.map((response, idx) => (
                              <tr
                                key={idx}
                                className={
                                  response.isCorrect
                                    ? "bg-green-100"
                                    : "bg-red-100"
                                }
                              >
                                <td className="px-4 py-2 font-medium flex flex-col items-start gap-2">
                                  <p className="text-sm">
                                    {/* {response.question}{" "} */}
                                    {splitQuestionBySpecialTag(
                                      response.question
                                    ).map((part, i) =>
                                      part.type === "latex" ? (
                                        <span className=" text-blue-400">
                                          <MathBlock
                                            key={i}
                                            item={part.content}
                                          />
                                        </span>
                                      ) : (
                                        <span
                                          key={i}
                                          className=" text-orange-400"
                                        >
                                          {part.content}
                                        </span>
                                      )
                                    )}
                                  </p>
                                  {response.image && (
                                    <>
                                      {response.image && (
                                        <Image
                                          src={response.image}
                                          alt="Question Image"
                                          height={200}
                                          width={200}
                                          className="rounded-md w-28 h-20"
                                          unoptimized
                                        />
                                      )}
                                    </>
                                  )}
                                </td>
                                <td className="px-4 py-2">
                                  {/* Display selected options text */}
                                  {/* {response.selectedOption
                                    .map((item) => item.content.text)
                                    .join(", ") || "Not Answered"} */}

                                  {response.selectedOption.length === 0 ? (
                                    <span className="text-muted-foreground">
                                      Not Answered
                                    </span>
                                  ) : (
                                    splitQuestionBySpecialTag(
                                      response.selectedOption
                                        .map((item) => item.content.text)
                                        .join(", ")
                                    ).map((part, i) =>
                                      part.type === "latex" ? (
                                        <span className="text-blue-400" key={i}>
                                          <MathBlock item={part.content} />
                                        </span>
                                      ) : (
                                        <span
                                          key={i}
                                          className="text-orange-400"
                                        >
                                          {part.content}
                                        </span>
                                      )
                                    )
                                  )}

                                  {/* Display images if there are any selected options */}
                                  {response.selectedOption.length > 0 && (
                                    <div className="mt-4 space-y-3">
                                      {response.selectedOption.map(
                                        (item, i) => (
                                          <div
                                            key={i}
                                            className="flex flex-col items-center gap-2"
                                          >
                                            {item.content.image &&
                                              item.content.image.map(
                                                (img, index) => (
                                                  <div
                                                    key={index}
                                                    className="w-28 h-20 overflow-hidden rounded-lg shadow-md"
                                                  >
                                                    <Image
                                                      src={img}
                                                      alt={`Option Image ${i}-${index}`}
                                                      height={200}
                                                      width={200}
                                                      className="w-full h-full object-cover"
                                                    />
                                                  </div>
                                                )
                                              )}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                                </td>

                                <td className="px-4 py-2 bg-black">
                                  {response.correctOption.length === 0 ? (
                                    <span className="text-muted-foreground">
                                      Not Answered
                                    </span>
                                  ) : (
                                    splitQuestionBySpecialTag(
                                      response.correctOption
                                        .map((item) => item.content.text)
                                        .join(", ")
                                    ).map((part, i) =>
                                      part.type === "latex" ? (
                                        <span className=" text-blue-400">
                                          <MathBlock
                                            key={i}
                                            item={part.content}
                                          />
                                        </span>
                                      ) : (
                                        <span
                                          key={i}
                                          className=" text-orange-400"
                                        >
                                          {part.content}
                                        </span>
                                      )
                                    )
                                  )}

                                  {/* Display images for correct options */}
                                  {response.correctOption.length > 0 && (
                                    <div className="mt-4 space-y-3">
                                      {response.correctOption.map((item, i) => (
                                        <div
                                          key={i}
                                          className="flex flex-col items-center gap-2"
                                        >
                                          {item.content.image &&
                                            item.content.image.map(
                                              (img, index) => (
                                                <div
                                                  key={index}
                                                  className="w-28 h-20 overflow-hidden rounded-lg shadow-md"
                                                >
                                                  <Image
                                                    src={img}
                                                    alt={`Option Image ${i}-${index}`}
                                                    height={200}
                                                    width={200}
                                                    className="w-full h-full object-cover"
                                                  />
                                                </div>
                                              )
                                            )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;
