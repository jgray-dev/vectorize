"use client";

import {useRouter} from "next/navigation";

export default function NavBar() {
  const router = useRouter()
  return (
  <div className={"fixed top-0 h-12 bg-white/5 flex items-center justify-between px-4 py-2 z-50 gap-8"}>
    <div className={"hover:text-white hover:cursor-pointer duration-200 bg-transparent text-gray-400"}
      onMouseDown={()=>{
      router.push("/")
    }}>
      Home
    </div>
    <div className={"hover:text-white hover:cursor-pointer duration-200 bg-transparent text-gray-400"}
      onMouseDown={()=>{
      router.push("/normalize")
    }}>
      Normalize Embeddings
    </div>
  </div>
    )
}