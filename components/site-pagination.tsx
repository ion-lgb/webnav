import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface SitePaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
  queryParams?: Record<string, string>
}

export function SitePagination({
  currentPage,
  totalPages,
  basePath,
  queryParams,
}: SitePaginationProps) {
  if (totalPages <= 1) return null

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams({ ...queryParams, page: String(page) })
    return `${basePath}?${params.toString()}`
  }

  const getVisiblePages = () => {
    const pages: number[] = []
    let start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, start + 4)
    start = Math.max(1, end - 4)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6">
      {currentPage > 1 && (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[13px] bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          上一页
        </Link>
      )}

      {visiblePages.map((page) => (
        <Link
          key={page}
          href={getPageUrl(page)}
          className={`px-3 py-1.5 rounded-md text-[13px] transition-colors ${
            page === currentPage
              ? "bg-primary text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[13px] bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          下一页
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  )
}
