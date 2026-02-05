"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getInitials, getImageUrl } from "@/lib/utils";
import { LuArrowLeft } from "react-icons/lu";

interface HeaderProps {
  editorMode?: boolean;
  editorTitle?: string;
}

export default function Header({
  editorMode = false,
  editorTitle = "Write Post",
}: HeaderProps) {
  const router = useRouter();
  const params = useSearchParams();
  const hasActiveSearch = !!params.get("q"); // Check if there's an active search query in URL
  const { user, logout, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchModalRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
      if (
        searchModalRef.current &&
        !searchModalRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
    router.push("/");
  };

  // Reusable User Avatar Component
  const UserAvatar = ({ size = 36 }: { size?: number }) =>
    user?.avatarUrl ? (
      <Image
        src={getImageUrl(user.avatarUrl)}
        alt={user.name || user.username}
        width={size}
        height={size}
        className="rounded-full object-cover ring-2 bg-primary-300"
      />
    ) : (
      <div
        className="rounded-full bg-primary-300 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white"
        style={{ width: size, height: size }}
      >
        {getInitials(user?.name || "")}
      </div>
    );

  // Profile Dropdown Menu (shared between desktop and mobile)
  const ProfileDropdown = () => {
    const handleMenuClick = () => {
      setIsProfileMenuOpen(false);
    };

    return (
      <div
        className="absolute right-0 top-full mt-2 w-56 py-2 bg-white rounded-xl shadow-xl border border-[var(--border-primary)] animate-fade-in z-50"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-[var(--border-secondary)]">
          <p className="font-semibold text-[var(--text-primary)]">
            {user?.name}
          </p>
          <p className="text-sm text-[var(--text-muted)]">@{user?.username}</p>
        </div>
        <Link
          href="/my-profile"
          onClick={handleMenuClick}
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          <svg
            className="w-5 h-5 text-[var(--text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="text-[var(--text-primary)]">My Profile</span>
        </Link>
        <Link
          href="/create"
          onClick={handleMenuClick}
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          <svg
            className="w-5 h-5 text-[var(--text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="text-[var(--text-primary)]">Write Post</span>
        </Link>
        <div className="border-t border-[var(--border-secondary)] mt-2 pt-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full hover:bg-[var(--bg-tertiary)] transition-colors text-red-500"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-neutral-200">
      <div className=" px-4 md:px-30 flex justify-between">
        <div className="flex items-center justify-between h-16 md:h-20       w-full">
          {/* Logo / Editor Header */}
          {editorMode ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <LuArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-base font-bold text-black">{editorTitle}</h1>
            </div>
          ) : (
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center">
                <Image
                  src="/logo-symbol.svg"
                  alt="Logo"
                  width={22}
                  height={22}
                  style={{ height: "auto" }}
                />
              </div>
              <span className="text-base font-bold md:text-2xl md:font-semibold md:leading-9 text-[var(--text-primary)]">
                Your<span className="text-[var(--accent-primary)]"> Logo</span>
              </span>
            </Link>
          )}

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md border border-neutral-300 rounded-md mx-8"
          >
            <div className="relative w-full group">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent-primary)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-12 py-2.5 bg-[var(--bg-secondary)] border-transparent focus:bg-white focus:border-[var(--accent-primary)]"
              />
            </div>
          </form>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full skeleton" />
            ) : user ? (
              <>
                <Link
                  href="/create"
                  className="btn btn-ghost gap-2 text-[var(--accent-primary)]"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  Write Post
                </Link>
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-primary-200 transition-colors"
                  >
                    <UserAvatar />
                    <span className="font-medium text-[var(--text-primary)]">
                      {user.name}
                    </span>
                  </button>
                  {isProfileMenuOpen && <ProfileDropdown />}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-primary-300 underline-offset-3 underline mr-1 pr-4 border-r-2 font-semibold"
                >
                  Login
                </Link>
                <Link href="/register" className="btn btn-primary md:h-11 w-46">
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Buttons */}
          <div className="md:hidden flex items-center gap-1">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full skeleton" />
            ) : user ? (
              /* Logged in: Show user avatar with dropdown */
              <>
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-primary-200 transition-colors"
                  >
                    <UserAvatar />
                  </button>
                  {isProfileMenuOpen && <ProfileDropdown />}
                </div>
              </>
            ) : (
              /* Not logged in: Show search + hamburger buttons */
              <>
                {!isMenuOpen && !hasActiveSearch && (
                  <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="p-2.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                    aria-label="Toggle search"
                  >
                    <svg
                      className="w-6 h-6 text-[var(--text-primary)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                  aria-label="Toggle menu"
                >
                  <svg
                    className="w-6 h-6 text-[var(--text-primary)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {isMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Search Modal - Only for non-logged in users */}
        {!user && isSearchOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20 px-4">
            <div
              ref={searchModalRef}
              className="w-full max-w-md bg-white rounded-xl shadow-xl p-4 animate-fade-in"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[var(--text-primary)]">
                  Search
                </h3>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-[var(--text-muted)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-12"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-full mt-3 py-2.5"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Menu - Only for non-logged in users */}
        {!user && isMenuOpen && (
          <div className="md:hidden h-screen w-full  py-4 border-t border-neutral-300 animate-fade-in">
            <nav className="flex flex-col mx-11 gap-1">
              <Link
                href="/login"
                className="flex items-center justify-center py-3 text-primary font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="flex items-center justify-center py-3 mx-4 rounded-full bg-primary text-white font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
