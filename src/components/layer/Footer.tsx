import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <span className="md:text-sm text-xs  justify-center text-neutral-600 flex">
            © {new Date().getFullYear()} Web Programming Hack Blog All rights
            reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
