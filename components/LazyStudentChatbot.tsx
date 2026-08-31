'use client';

import dynamic from "next/dynamic";

const StudentChatbot = dynamic(() => import("./StudentChatbot"), {
  ssr: false,
  loading: () => null
});

export default function LazyStudentChatbot() {
  return <StudentChatbot />;
}