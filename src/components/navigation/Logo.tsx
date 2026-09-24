import { Link } from "react-router-dom";
import { PawPrint } from "lucide-react";
import { shortBrand } from "@/lib/utils";

export function Logo({ name, onClick }: { name: string; onClick?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label={`${name} — home`}
      className="flex items-center gap-2.5"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sun text-[#121E38]">
        <PawPrint aria-hidden="true" className="h-5 w-5" strokeWidth={2.25} />
      </span>
      <span className="font-display text-xl font-bold leading-none tracking-tight">
        {shortBrand(name)}
      </span>
    </Link>
  );
}
