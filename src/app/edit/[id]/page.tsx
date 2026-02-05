"use client";

import { useParams } from "next/navigation";
import PostEditor from "@/components/List/PostEditor";
import Header from "@/components/layer/Header";

export default function EditPostPage() {
  const params = useParams();
  const postId = parseInt(params.id as string);

  return (
    <>
      <Header editorMode editorTitle="Edit Post" />
      <PostEditor mode="edit" postId={postId} />
    </>
  );
}
