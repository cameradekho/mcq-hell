import { useEffect, useState } from "react";

import { Search } from "lucide-react";

import { useDebounce } from "@/hooks/custom/use-debounce";
import { useQueryParams } from "@/hooks/custom/use-query-params";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SearchBarProps = {
  placeholder?: string;
  debounceDelay?: number;
  containerClassName?: string;
  searchParamKey: string;
  value?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (value: string) => void;
};

export const SearchBar = ({
  placeholder = "Search...",
  debounceDelay = 500,
  containerClassName,
  searchParamKey,
  value: controlledValue,
  className,
  onSearch,
  onChange,
}: SearchBarProps) => {
  const { params, updateParams } = useQueryParams();
  const [searchQuery, setSearchQuery] = useState<string>(
    controlledValue?.toString() || params[searchParamKey] || ""
  );
  const debouncedSearchQuery = useDebounce(searchQuery, debounceDelay);

  useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== searchQuery) {
      setSearchQuery(controlledValue.toString());
    }
  }, [controlledValue, searchQuery]);

  useEffect(() => {
    if (searchParamKey) {
      const isInitialLoad =
        debouncedSearchQuery === (params[searchParamKey] || "");
      updateParams({
        [searchParamKey]: debouncedSearchQuery || undefined,
        page: isInitialLoad ? params.page : "1",
      });
    }

    onSearch?.(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    onChange?.(e);
  };

  return (
    <div
      className={cn(
        "border-input relative flex-1 overflow-hidden rounded-md border bg-white",
        containerClassName
      )}
    >
      <Input
        className={cn(
          "placeholder:text-muted-foreground h-10 w-full border-0 bg-transparent pl-10 pr-4 text-sm focus-visible:ring-0",
          className
        )}
        placeholder={placeholder}
        type="text"
        value={searchQuery}
        onChange={handleChange}
      />
      <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
    </div>
  );
};
