"use client";

import { Questions } from "@/components/questions";

type Props = {
  userEmail: string;
};

export const QuestionsWrapper = ({ userEmail }: Props) => {
  return <Questions userEmail={userEmail} />;
};
