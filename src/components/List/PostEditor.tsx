"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createPost, updatePost, getPostById } from "@/Services/api/post";
import { getInitials, getImageUrl } from "@/lib/utils";
import type { Post } from "@/types/blog";
import LoadingSpinner from "@/components/LoadingSpinner";

// Shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// React Icons
import {
  LuArrowLeft,
  LuBold,
  LuItalic,
  LuStrikethrough,
  LuList,
  LuListOrdered,
  LuAlignLeft,
  LuAlignCenter,
  LuAlignRight,
  LuAlignJustify,
  LuLink,
  LuUnlink,
  LuImage,
  LuMinus,
  LuX,
  LuUpload,
  LuTrash2,
  LuLoader,
  LuLock,
} from "react-icons/lu";

interface PostEditorProps {
  mode: "create" | "edit";
  postId?: number;
}

export default function PostEditor({ mode, postId }: PostEditorProps) {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [post, setPost] = useState<Post | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(mode === "edit");
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch post data for edit mode
  useEffect(() => {
    if (mode === "edit" && postId && !authLoading && user) {
      const fetchPost = async () => {
        try {
          const postData = await getPostById(postId);
          setPost(postData);
          setFormData({ title: postData.title, content: postData.content });
          setTags(postData.tags || []);
          if (postData.imageUrl)
            setImagePreview(getImageUrl(postData.imageUrl));
        } catch (error) {
          console.error("Failed to fetch post:", error);
          router.push("/my-profile");
        } finally {
          setIsLoadingPost(false);
        }
      };
      fetchPost();
    }
  }, [mode, postId, authLoading, user, router]);

  // Set content after post is loaded
  useEffect(() => {
    if (post && contentRef.current && !contentRef.current.innerHTML) {
      contentRef.current.innerHTML = post.content;
    }
  }, [post]);

  // Auth redirects
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(
        `/login?redirect=${mode === "edit" ? `/edit/${postId}` : "/create"}`,
      );
    }
  }, [user, authLoading, router, mode, postId]);

  useEffect(() => {
    if (
      mode === "edit" &&
      !isLoadingPost &&
      post &&
      user &&
      post.author.id !== user.id
    ) {
      router.push("/my-profile");
    }
  }, [mode, post, isLoadingPost, user, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: "Max file size is 5MB" });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors({ ...errors, image: "" });
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Tag management
  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) setTags([...tags, trimmed]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  // Rich text commands
  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    contentRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!contentRef.current?.innerText.trim())
      newErrors.content = "Content is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0 || !token) return;

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("content", contentRef.current?.innerHTML || "");
      tags.forEach((tag) => data.append("tags", tag));
      if (imageFile) data.append("image", imageFile);

      if (mode === "edit" && postId) {
        await updatePost(token, postId, data);
        router.push(`/blog/${postId}`);
      } else {
        await createPost(token, data);
        router.push("/my-profile");
      }
    } catch (error) {
      console.error(`Failed to ${mode} post:`, error);
      router.push("/my-profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading
  if (authLoading || isLoadingPost) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner
          size="lg"
          text={mode === "edit" ? "Loading post..." : "Loading..."}
        />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center px-4 m-4">
        <div className="card p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--accent-light)] flex items-center justify-center">
            <LuLock className="w-8 h-8 text-[var(--accent-primary)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Login Required
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            You need to be logged in to {mode === "edit" ? "edit" : "write"} a
            post.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link
                href={`/login?redirect=${mode === "edit" ? `/edit/${postId}` : "/create"}`}
              >
                Login
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "edit" && post && post.author.id !== user.id) return null;

  // Toolbar button helper
  const ToolBtn = ({
    icon: Icon,
    title,
    onClick,
  }: {
    icon: React.ElementType;
    title: string;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 rounded hover:bg-[var(--bg-tertiary)]"
      title={title}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className="min-h-screen bg-white m-4">
      {/* Form */}
      <div className="container py-8">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter your title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border border-b-0 rounded-t-lg bg-[var(--bg-secondary)]">
              <Select onValueChange={(v) => exec("formatBlock", v)}>
                <SelectTrigger className="w-28 h-8">
                  <SelectValue placeholder="Heading" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">Heading 1</SelectItem>
                  <SelectItem value="h2">Heading 2</SelectItem>
                  <SelectItem value="h3">Heading 3</SelectItem>
                  <SelectItem value="p">Paragraph</SelectItem>
                </SelectContent>
              </Select>

              <div className="w-px h-6 bg-[var(--border-primary)] mx-1" />

              <ToolBtn
                icon={LuBold}
                title="Bold"
                onClick={() => exec("bold")}
              />
              <ToolBtn
                icon={LuStrikethrough}
                title="Strikethrough"
                onClick={() => exec("strikeThrough")}
              />
              <ToolBtn
                icon={LuItalic}
                title="Italic"
                onClick={() => exec("italic")}
              />

              <div className="w-px h-6 bg-[var(--border-primary)] mx-1" />

              <ToolBtn
                icon={LuList}
                title="Bullet List"
                onClick={() => exec("insertUnorderedList")}
              />
              <ToolBtn
                icon={LuListOrdered}
                title="Numbered List"
                onClick={() => exec("insertOrderedList")}
              />

              <div className="w-px h-6 bg-[var(--border-primary)] mx-1" />

              <ToolBtn
                icon={LuAlignLeft}
                title="Align Left"
                onClick={() => exec("justifyLeft")}
              />
              <ToolBtn
                icon={LuAlignCenter}
                title="Align Center"
                onClick={() => exec("justifyCenter")}
              />
              <ToolBtn
                icon={LuAlignRight}
                title="Align Right"
                onClick={() => exec("justifyRight")}
              />
              <ToolBtn
                icon={LuAlignJustify}
                title="Justify"
                onClick={() => exec("justifyFull")}
              />

              <div className="w-px h-6 bg-[var(--border-primary)] mx-1" />

              <ToolBtn
                icon={LuLink}
                title="Insert Link"
                onClick={() => {
                  const url = prompt("Enter URL:");
                  if (url) exec("createLink", url);
                }}
              />
              <ToolBtn
                icon={LuUnlink}
                title="Remove Link"
                onClick={() => exec("unlink")}
              />
              <ToolBtn
                icon={LuImage}
                title="Insert Image"
                onClick={() => {
                  const url = prompt("Enter image URL:");
                  if (url) exec("insertImage", url);
                }}
              />
              <ToolBtn
                icon={LuMinus}
                title="Horizontal Line"
                onClick={() => exec("insertHorizontalRule")}
              />
              <ToolBtn
                icon={LuX}
                title="Clear Format"
                onClick={() => exec("removeFormat")}
              />
            </div>

            <div
              ref={contentRef}
              contentEditable
              className="min-h-[200px] p-4 border rounded-b-lg focus:outline-none focus:border-[var(--accent-primary)] prose prose-sm max-w-none prose-content"
              onInput={(e) =>
                setFormData({
                  ...formData,
                  content: (e.target as HTMLDivElement).innerHTML,
                })
              }
              data-placeholder="Enter your content"
              suppressContentEditableWarning
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Cover Image
            </label>
            <div className="border rounded-lg p-4">
              {imagePreview ? (
                <div className="flex flex-col items-center">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={400}
                    height={250}
                    className="rounded-lg object-cover mb-4"
                  />
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <LuUpload className="w-4 h-4 mr-2" /> Change Image
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="text-red-500 border-red-200 hover:bg-red-50"
                      onClick={removeImage}
                    >
                      <LuTrash2 className="w-4 h-4 mr-2" /> Delete Image
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    PNG or JPG (max. 5mb)
                  </p>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer hover:border-[var(--accent-primary)]">
                  <LuImage className="w-10 h-10 text-muted-foreground mb-2" />
                  <span className="text-primary-300 font-semibold text-sm">
                    Click to upload
                  </span>
                  <span className="text-sm text-muted-foreground">
                    or drag and drop
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    PNG or JPG (max. 5mb)
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            {errors.image && (
              <p className="text-red-500 text-sm mt-1">{errors.image}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex flex-wrap items-center gap-2 p-3 border rounded-lg focus-within:border-[var(--accent-primary)]">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-foreground"
                  >
                    <LuX className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => tagInput && addTag(tagInput)}
                placeholder={tags.length === 0 ? "Enter your tags" : ""}
                className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-12 w-full h-11 rounded-full"
            >
              {isSubmitting ? (
                <>
                  <LuLoader className="w-4 h-4 mr-2 animate-spin" />
                  {mode === "edit" ? "Saving..." : "Publishing..."}
                </>
              ) : mode === "edit" ? (
                "Save"
              ) : (
                "Finish"
              )}
            </Button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--text-muted);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
