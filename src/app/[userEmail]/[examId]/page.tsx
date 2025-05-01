import React from "react";

type Props = {
  userEmail: string;
  examId: string;
};

const Home = (props: Props) => {
  const userEmail = decodeURIComponent(props.userEmail);
  const examId = decodeURIComponent(props.examId);

  if (!userEmail || !examId) return <div>Missing userEmail or listName</div>;
  return (
    <div>
      <span>User: {userEmail}</span>
      <span>List: {examId}</span>
    </div>
  );
};

export default Home;
