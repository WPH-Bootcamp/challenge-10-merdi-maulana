import PostEditor from "@/components/List/PostEditor";
import Header from "@/components/layer/Header";

export default function CreatePostPage() {
  return (
    <>
      <Header editorMode editorTitle="Write Post" />
      <PostEditor mode="create" />
    </>
  );
}
