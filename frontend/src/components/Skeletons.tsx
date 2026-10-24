export function ProjectSkeleton() {
  return (
    <div className="min-h-[380px] sm:min-h-[410px] w-full rounded-none border border-[#111215]/20 bg-[#111215] shadow-xs flex flex-col justify-between p-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="w-16 h-4 rounded-none bg-white/10" />
        <div className="w-14 h-4 rounded-none bg-white/10" />
      </div>
      <div>
        <div className="flex gap-1.5 mb-2.5">
          <div className="w-12 h-3.5 rounded-none bg-white/10" />
          <div className="w-16 h-3.5 rounded-none bg-white/10" />
        </div>
        <div className="w-3/4 h-5 rounded-none bg-white/15 mb-2" />
        <div className="w-full h-3 rounded-none bg-white/10 mb-1" />
        <div className="w-4/5 h-3 rounded-none bg-white/10 mb-4" />
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="w-20 h-3 rounded-none bg-white/10" />
          <div className="w-14 h-3 rounded-none bg-white/10" />
        </div>
      </div>
    </div>
  )
}

export function MemberSkeleton() {
  return (
    <div className="bg-[#111215]/5 rounded-[20px] border border-[#111215]/8 h-[420px] p-6 shadow-2xs flex flex-col justify-end animate-pulse">
      <div className="w-24 h-4 bg-[#111215]/10 mb-2 rounded" />
      <div className="w-32 h-3.5 bg-[#111215]/8 rounded" />
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

export function NewsCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#111215]/8 overflow-hidden shadow-2xs flex flex-col p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-24 h-6 rounded-xl bg-[#111215]/8" />
        <div className="w-16 h-4 rounded bg-[#111215]/6" />
      </div>
      <div className="w-4/5 h-6 rounded-md bg-[#111215]/10 mb-3" />
      <div className="w-full h-3.5 rounded bg-[#111215]/6 mb-2" />
      <div className="w-full h-3.5 rounded bg-[#111215]/6 mb-2" />
      <div className="w-2/3 h-3.5 rounded bg-[#111215]/6 mb-6 flex-1" />
      <div className="pt-4 border-t border-[#111215]/8 flex items-center justify-between">
        <div className="w-28 h-4 rounded bg-[#111215]/8" />
        <div className="w-16 h-4 rounded bg-[#111215]/8" />
      </div>
    </div>
  )
}

export function AchievementSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#111215]/8 overflow-hidden shadow-2xs flex flex-col p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-[#111215]/8" />
          <div className="w-24 h-6 rounded-xl bg-[#111215]/8" />
        </div>
        <div className="w-20 h-5 rounded-md bg-[#111215]/8" />
      </div>
      <div className="w-3/4 h-5 rounded-md bg-[#111215]/10 mb-2" />
      <div className="w-1/2 h-4 rounded bg-[#111215]/8 mb-4" />
      <div className="w-full h-3 rounded bg-[#111215]/6 mb-2" />
      <div className="w-5/6 h-3 rounded bg-[#111215]/6 mb-5 flex-1" />
      <div className="pt-4 border-t border-[#111215]/8 flex items-center justify-between">
        <div className="w-32 h-4 rounded bg-[#111215]/8" />
        <div className="w-20 h-4 rounded bg-[#111215]/8" />
      </div>
    </div>
  )
}

export function HistorySkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#111215]/8 p-5 sm:p-6 shadow-2xs animate-pulse flex flex-col sm:flex-row gap-4 sm:gap-6">
      <div className="sm:w-36 shrink-0">
        <div className="w-24 h-4 rounded bg-[#111215]/10" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="w-48 h-5 rounded bg-[#111215]/10" />
        <div className="w-full h-4 rounded bg-[#111215]/6" />
      </div>
    </div>
  )
}

export function DashboardRowSkeleton() {
  return (
    <div className="p-4 border-b border-[#111215]/6 animate-pulse grid grid-cols-12 gap-3 items-center">
      <div className="col-span-3 space-y-1.5">
        <div className="w-24 h-3.5 rounded bg-[#111215]/10" />
        <div className="w-16 h-2.5 rounded bg-[#111215]/6" />
      </div>
      <div className="col-span-4 space-y-1.5">
        <div className="w-44 h-3.5 rounded bg-[#111215]/10" />
        <div className="w-28 h-2.5 rounded bg-[#111215]/6" />
      </div>
      <div className="col-span-2">
        <div className="w-20 h-4 rounded bg-[#111215]/10" />
      </div>
      <div className="col-span-1">
        <div className="w-14 h-5 rounded bg-[#111215]/8" />
      </div>
      <div className="col-span-2 flex justify-end">
        <div className="w-16 h-7 rounded-lg bg-[#111215]/8" />
      </div>
    </div>
  )
}

export function TokenRowSkeleton() {
  return (
    <div className="p-4 border-b border-[#111215]/6 animate-pulse grid grid-cols-12 gap-3 items-center">
      <div className="col-span-4 space-y-1.5">
        <div className="w-32 h-4 rounded bg-[#111215]/10" />
      </div>
      <div className="col-span-3 space-y-1.5">
        <div className="w-28 h-3.5 rounded bg-[#111215]/10" />
        <div className="w-20 h-2.5 rounded bg-[#111215]/6" />
      </div>
      <div className="col-span-2">
        <div className="w-20 h-5 rounded bg-[#111215]/8" />
      </div>
      <div className="col-span-1">
        <div className="w-12 h-5 rounded bg-[#111215]/8" />
      </div>
      <div className="col-span-2 flex justify-end space-x-1.5">
        <div className="w-7 h-7 rounded-lg bg-[#111215]/8" />
        <div className="w-7 h-7 rounded-lg bg-[#111215]/8" />
      </div>
    </div>
  )
}
