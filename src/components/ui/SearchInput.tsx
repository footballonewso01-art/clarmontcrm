"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";

export function SearchInput({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(searchParams.get("q") || "");

  function onSearch(term: string) {
    setValue(term);
    const params = new URLSearchParams(searchParams.toString());
    if (term) params.set("q", term);
    else params.delete("q");
    
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <input
      type="text"
      className="input"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onSearch(e.target.value)}
      style={{ maxWidth: "300px", opacity: isPending ? 0.7 : 1 }}
    />
  );
}
