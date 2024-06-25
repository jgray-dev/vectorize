"use client";

import { useRouter } from "next/navigation";

export default function NavBar() {
  const router = useRouter();
  return (
    <div
      className={
        "fixed top-0 z-50 flex h-12 w-full items-center justify-between gap-8 bg-black/55 px-4 py-2 backdrop-blur-md"
      }
    >
      <div
        className={
          "bg-transparent text-gray-400 duration-200 hover:cursor-pointer hover:text-white"
        }
        onMouseDown={() => {
          router.push("/");
        }}
      >
        Home
      </div>
      <div
        className={
          "bg-transparent text-gray-400 duration-200 hover:cursor-pointer hover:text-white"
        }
        onMouseDown={() => {
          router.push("/normalize");
        }}
      >
        Normalize
      </div>
      <div
        className={
          "bg-transparent text-gray-400 duration-200 hover:cursor-pointer hover:text-white"
        }
        onMouseDown={() => {
          router.push("/visualize");
        }}
      >
        Visualize
      </div>
      <div
        className={
          "bg-transparent text-gray-400 duration-200 hover:cursor-pointer hover:text-white"
        }
        onMouseDown={() => {
          router.push("/graph");
        }}
      >
        Graph
      </div>
    </div>
  );
}
