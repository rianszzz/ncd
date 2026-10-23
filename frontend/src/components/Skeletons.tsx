export function ProjectSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#111215]/8 overflow-hidden shadow-2xs flex flex-col animate-pulse">
      <div className="p-5 border-b border-[#111215]/8 flex items-center justify-between bg-[#F4F1EB]/40">
        <div className="w-10 h-10 rounded-xl bg-[#111215]/10" />
        <div className="w-16 h-5 rounded-md bg-[#111215]/10" />
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex gap-1.5 mb-3">
          <div className="w-12 h-5 rounded-md bg-[#111215]/8" />
          <div className="w-16 h-5 rounded-md bg-[#111215]/8" />
        </div>
        <div className="w-3/4 h-5 rounded-md bg-[#111215]/10 mb-2" />
        <div className="w-full h-3 rounded bg-[#111215]/6 mb-1.5" />
        <div className="w-4/5 h-3 rounded bg-[#111215]/6 mb-4 flex-1" />
        <div className="pt-4 border-t border-[#111215]/8 flex items-center justify-between">
          <div className="w-20 h-4 rounded bg-[#111215]/8" />
          <div className="w-14 h-4 rounded bg-[#111215]/8" />
        </div>
      </div>
    </div>
  )
}

export function MemberSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#111215]/8 p-6 shadow-2xs flex flex-col items-center text-center animate-pulse">
      <div className="w-16 h-16 rounded-2xl bg-[#111215]/10 mb-4" />
      <div className="w-20 h-4 rounded-md bg-[#111215]/8 mb-2" />
      <div className="w-32 h-5 rounded-md bg-[#111215]/10 mb-1" />
      <div className="w-24 h-3 rounded bg-[#111215]/6 mb-3" />
      <div className="w-full h-3 rounded bg-[#111215]/6 mb-1.5" />
      <div className="w-5/6 h-3 rounded bg-[#111215]/6 mb-4 flex-1" />
      <div className="w-full pt-4 border-t border-[#111215]/8 flex items-center justify-center space-x-3">
        <div className="w-4 h-4 rounded-full bg-[#111215]/10" />
        <div className="w-4 h-4 rounded-full bg-[#111215]/10" />
      </div>
    </div>
  )
}

export function SummarySkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-white border border-[#111215]/8 shadow-2xs animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="w-24 h-3 rounded bg-[#111215]/8" />
        <div className="w-3 h-3 rounded-full bg-[#111215]/10" />
      </div>
      <div className="w-36 h-8 rounded-md bg-[#111215]/10 my-2" />
      <div className="w-28 h-3 rounded bg-[#111215]/6" />
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="py-4 px-4"><div className="w-20 h-4 rounded bg-[#111215]/10" /></td>
      <td className="py-4 px-4"><div className="w-16 h-3 rounded bg-[#111215]/8" /></td>
      <td className="py-4 px-4"><div className="w-24 h-4 rounded bg-[#111215]/8" /></td>
      <td className="py-4 px-4"><div className="w-36 h-3 rounded bg-[#111215]/8" /></td>
      <td className="py-4 px-4"><div className="w-20 h-4 rounded bg-[#111215]/10" /></td>
      <td className="py-4 px-4"><div className="w-16 h-3 rounded bg-[#111215]/8" /></td>
      <td className="py-4 px-4"><div className="w-20 h-4 rounded bg-[#111215]/8" /></td>
      <td className="py-4 px-4 text-center"><div className="w-8 h-4 rounded bg-[#111215]/8 mx-auto" /></td>
    </tr>
  )
}
