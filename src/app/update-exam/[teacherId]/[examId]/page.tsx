"use client";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { IExam, IQuestion } from "@/models/exam";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, FileQuestion, Plus, Save, Trash2, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { fetchExamById } from "../../../../../action/fetch-exam-by-id";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { updateExamByExamIdAndTeacherId } from "../../../../../action/update-exam-by-examId-and-teacherId";

const UpdateExamPage = () => {
  const { teacherId, examId } = useParams() as {
    teacherId: string;
    examId: string;
  };

  const [exam, setExam] = useState<IExam | null>(null);
  const [originalExam, setOriginalExam] = useState<IExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newOptionText, setNewOptionText] = useState("");
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null
  );
  const [optionError, setOptionError] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    async function fetchExam() {
      try {
        setLoading(true);
        const res = await fetchExamById({ teacherId, examId });

        if (res.success) {
          setExam(res.data);
          setOriginalExam(JSON.parse(JSON.stringify(res.data))); // Deep clone for comparison
        } else {
          toast.error(res.message || "Failed to fetch exam");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching exam");
      } finally {
        setLoading(false);
      }
    }

    if (teacherId && examId) {
      fetchExam();
    } else {
      setLoading(false);
    }
  }, [teacherId, examId]);

  // Check for changes whenever exam is updated
  useEffect(() => {
    if (exam && originalExam) {
      const isChanged = JSON.stringify(exam) !== JSON.stringify(originalExam);
      setIsDirty(isChanged);
    }
  }, [exam, originalExam]);

  const session = useSession();
  const userEmail = session?.data?.user?.email;

  const handleCorrectAnswerChange = (
    questionId: string,
    optionValue: string
  ) => {
    setExam((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId ? { ...q, answer: optionValue } : q
        ),
      };
    });
  };

  const openAddOptionDialog = (questionId: string) => {
    setCurrentQuestionId(questionId);
    setNewOptionText("");
    setOptionError(false);
    setDialogOpen(true);
  };

  const handleAddOption = () => {
    if (!newOptionText.trim()) {
      setOptionError(true);
      return;
    }

    if (currentQuestionId && exam) {
      setExam((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: prev.questions.map((q) =>
            q.id === currentQuestionId
              ? {
                  ...q,
                  options: [...q.options, newOptionText.trim()],
                }
              : q
          ),
        };
      });

      setDialogOpen(false);
      toast.success("Option added successfully");
    }
  };

  const copyOptionToClipboard = (option: string) => {
    navigator.clipboard
      .writeText(option)
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => toast.error("Failed to copy"));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setExam((prev) => {
      if (!prev) return prev;
      const question = prev.questions.find((q) => q.id === questionId);
      if (!question) return prev;

      const newOptions = [...question.options];
      newOptions.splice(optionIndex, 1);

      // If removing the correct answer, reset it to the first option
      const newAnswer =
        question.answer === question.options[optionIndex]
          ? newOptions.length > 0
            ? newOptions[0]
            : ""
          : question.answer;

      return {
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId
            ? { ...q, options: newOptions, answer: newAnswer }
            : q
        ),
      };
    });
  };

  const removeQuestion = (questionId: string) => {
    setExam((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.filter((q) => q.id !== questionId),
      };
    });
  };

  const handleSaveExam = async () => {
    if (exam) {
      const invalidQuestions = exam.questions.filter(
        (q) => q.options.length === 0
      );

      if (invalidQuestions.length > 0) {
        toast.error(
          `${invalidQuestions.length} question(s) have no options. Please add at least one option to each question.`
        );
        return;
      }

      try {
        console.log("Updated exam data:", exam);
        const res = await updateExamByExamIdAndTeacherId({
          examId: exam.id,
          teacherId: teacherId,
          exam: exam,
        });

        if (res.success) {
          toast.success("Exam updated successfully!");
          setOriginalExam(JSON.parse(JSON.stringify(exam)));
          setIsDirty(false);
        } else {
          toast.error(res.message || "Failed to update exam");
          return;
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to update exam");
        return;
      }
    }
  };

  const addNewQuestion = () => {
    if (!exam) return;

    setExam({
      ...exam,
      questions: [
        ...exam.questions,
        {
          id: new Date().toISOString(),
          question: "New question",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          answer: "Option 1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent leading zeros and convert to number
    const value = e.target.value.replace(/^0+/, "") || "";
    setExam((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        duration: value === "" ? 0 : Number(value),
      };
    });
  };

  if (!teacherId || !examId) {
    return (
      <div className="p-4 text-red-500">
        <h3 className="font-bold">Missing Required Parameters</h3>
        <p>userEmail: {teacherId ? `"${teacherId}"` : "missing"}</p>
        <p>examName: {examId ? `"${examId}"` : "missing"}</p>
        <p className="mt-4">
          Please ensure both parameters are provided in the URL.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="p-6 text-center">
        <h3 className="text-xl font-semibold mb-4">Exam Not Found</h3>
        <p>
          Could not find the requested exam. Please check the exam name and try
          again.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h3 className="text-2xl font-semibold">Update Exam</h3>
        <div className="flex gap-3">
          {isDirty && (
            <Badge
              variant="outline"
              className="bg-yellow-50 text-yellow-700 border-yellow-300"
            >
              Unsaved changes
            </Badge>
          )}
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleSaveExam}
            disabled={!isDirty}
          >
            <Save className="mr-2 h-4 w-4" />
            {isDirty ? "Save Changes" : "No Changes"}
          </Button>
        </div>
      </div>

      {/* Add Option Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Option</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-option" className="mb-2 block">
              Option Text
            </Label>
            <Input
              id="new-option"
              value={newOptionText}
              onChange={(e) => {
                setNewOptionText(e.target.value);
                if (e.target.value.trim()) {
                  setOptionError(false);
                }
              }}
              className={optionError ? "border-red-500" : ""}
              placeholder="Enter option text"
            />
            {optionError && (
              <p className="text-red-500 text-xs mt-1">
                Option text cannot be empty
              </p>
            )}
          </div>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button variant="outline" className="mt-2 sm:mt-0">
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleAddOption} className="mt-2 sm:mt-0">
              <Plus className="h-4 w-4 mr-2" /> Add Option
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="mb-6 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Exam Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="user-email" className="text-sm font-medium">
                User Email
              </Label>
              <Input
                id="user-email"
                value={userEmail || ""}
                disabled
                className="bg-gray-50 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="exam-name" className="text-sm font-medium">
                Exam Name
              </Label>
              <Input
                id="exam-name"
                value={exam.name}
                onChange={(e) => setExam({ ...exam, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={exam.description}
                onChange={(e) =>
                  setExam({ ...exam, description: e.target.value })
                }
                className="min-h-20 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="duration" className="text-sm font-medium">
                Duration (minutes)
              </Label>
              <Input
                id="duration"
                type="number"
                value={exam.duration.toString()}
                onChange={handleDurationChange}
                className="mt-1"
                min="1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold">Questions</h4>
        <Button
          variant="outline"
          className="border-dashed"
          onClick={addNewQuestion}
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Question
        </Button>
      </div>

      {exam.questions.length === 0 ? (
        <Card className="p-8 text-center text-gray-500 border-dashed">
          <div className="mb-4 flex justify-center">
            <FileQuestion className="h-12 w-12 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium mb-2">No Questions Yet</h4>
          <p className="mb-4">Start by adding some questions to your exam.</p>
          <Button onClick={addNewQuestion}>
            <Plus className="mr-2 h-4 w-4" /> Add Your First Question
          </Button>
        </Card>
      ) : (
        exam.questions.map((question, questionIndex) => (
          <Card
            key={question.id}
            className="mb-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="flex flex-row items-start justify-between pb-2 bg-gray-50">
              <CardTitle className="text-lg flex items-center">
                <span className="bg-primary text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-2 text-sm">
                  {questionIndex + 1}
                </span>
                Question
              </CardTitle>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeQuestion(question.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Remove
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor={`question-${question.id}`}
                    className="text-sm font-medium"
                  >
                    Question Text
                  </Label>
                  <Input
                    id={`question-${question.id}`}
                    value={question.question}
                    onChange={(e) =>
                      setExam({
                        ...exam,
                        questions: exam.questions.map((q) =>
                          q.id === question.id
                            ? { ...q, question: e.target.value }
                            : q
                        ),
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium">Options</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAddOptionDialog(question.id)}
                      className="text-blue-600"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Option
                    </Button>
                  </div>

                  {question.options.length > 0 ? (
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex items-center gap-2 p-2 border rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1 overflow-hidden overflow-ellipsis">
                            <span className="font-medium text-gray-700">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>{" "}
                            {option}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyOptionToClipboard(option)}
                              className="text-blue-500 hover:text-blue-700"
                              title="Copy to clipboard"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeOption(question.id, optionIndex)
                              }
                              className="text-red-500 hover:text-red-700"
                              title="Remove option"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 border border-dashed rounded-md">
                      No options added yet. Click "Add Option" to add some.
                    </div>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor={`correct-answer-${question.id}`}
                    className="text-sm font-medium"
                  >
                    Correct Answer
                  </Label>
                  {question.options.length > 0 ? (
                    <Select
                      value={question.answer}
                      onValueChange={(value) =>
                        handleCorrectAnswerChange(question.id, value)
                      }
                    >
                      <SelectTrigger
                        id={`correct-answer-${question.id}`}
                        className="w-full mt-1"
                      >
                        <SelectValue placeholder="Select the correct answer" />
                      </SelectTrigger>
                      <SelectContent>
                        {question.options.map((option, index) => (
                          <SelectItem key={index} value={option}>
                            <span className="font-medium">
                              {String.fromCharCode(65 + index)}.
                            </span>{" "}
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-3 text-gray-500 border rounded-md mt-1">
                      Add options first to select a correct answer
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <div className="mt-8 flex justify-between items-center">
        <Button variant="outline" onClick={addNewQuestion}>
          <Plus className="mr-2 h-4 w-4" /> Add Another Question
        </Button>

        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={handleSaveExam}
          disabled={!isDirty}
        >
          <Save className="mr-2 h-4 w-4" />
          {isDirty ? "Save Changes" : "No Changes"}
        </Button>
      </div>
    </div>
  );
};

export default UpdateExamPage;
