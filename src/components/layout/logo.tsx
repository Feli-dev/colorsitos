import { cn } from "@/lib/utils";

interface LogoProps {
  size?:
    | "size-4"
    | "size-6"
    | "size-8"
    | "size-10"
    | "size-12"
    | "size-16"
    | "size-20";
  className?: string;
  interactive?: boolean;
}

export function Logo({
  size = "size-6",
  className,
  interactive = false,
}: LogoProps) {
  // Size map for the nested marks
  const sizeMap = {
    "size-4": {
      container: "size-4",
      first: "size-4",
      second: "size-3",
      third: "size-2.5",
      fourth: "size-2",
      offset1: "top-0 left-0",
      offset2: "top-0.5 left-0.5",
      offset3: "top-1 left-1",
      offset4: "top-1.5 left-1.5",
    },
    "size-6": {
      container: "size-6",
      first: "size-6",
      second: "size-5",
      third: "size-4",
      fourth: "size-3",
      offset1: "top-0 left-0",
      offset2: "top-0.5 left-0.5",
      offset3: "top-1 left-1",
      offset4: "top-1.5 left-1.5",
    },
    "size-8": {
      container: "size-8",
      first: "size-8",
      second: "size-7",
      third: "size-6",
      fourth: "size-5",
      offset1: "top-0 left-0",
      offset2: "top-0.5 left-0.5",
      offset3: "top-1 left-1",
      offset4: "top-1.5 left-1.5",
    },
    "size-10": {
      container: "size-10",
      first: "size-10",
      second: "size-8",
      third: "size-6",
      fourth: "size-4",
      offset1: "top-0 left-0",
      offset2: "top-1 left-1",
      offset3: "top-2 left-2",
      offset4: "top-3 left-3",
    },
    "size-12": {
      container: "size-12",
      first: "size-12",
      second: "size-10",
      third: "size-8",
      fourth: "size-6",
      offset1: "top-0 left-0",
      offset2: "top-1 left-1",
      offset3: "top-2 left-2",
      offset4: "top-3 left-3",
    },
    "size-16": {
      container: "size-16",
      first: "size-16",
      second: "size-12",
      third: "size-10",
      fourth: "size-8",
      offset1: "top-0 left-0",
      offset2: "top-2 left-2",
      offset3: "top-3 left-3",
      offset4: "top-4 left-4",
    },
    "size-20": {
      container: "size-20",
      first: "size-20",
      second: "size-16",
      third: "size-12",
      fourth: "size-10",
      offset1: "top-0 left-0",
      offset2: "top-2 left-2",
      offset3: "top-4 left-4",
      offset4: "top-5 left-5",
    },
  };

  const dimensions = sizeMap[size];

  return (
    <div
      className={cn(
        "relative",
        dimensions.container,
        interactive && "hover:scale-110 transition-transform duration-300",
        className
      )}
    >
      <div
        className={cn(
          "absolute rounded bg-[#DCCEED] rotate-45 scale-100",
          dimensions.first,
          dimensions.offset1
        )}
      />
      <div
        className={cn(
          "absolute rounded bg-[#9A6BDB] rotate-45 scale-90",
          dimensions.second,
          dimensions.offset2
        )}
      />
      <div
        className={cn(
          "absolute rounded bg-[#672AC0] rotate-45 scale-75",
          dimensions.third,
          dimensions.offset3
        )}
      />
      <div
        className={cn(
          "absolute rounded bg-[#421C82] rotate-45 scale-60",
          dimensions.fourth,
          dimensions.offset4
        )}
      />
    </div>
  );
}
