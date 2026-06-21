"use client"

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Pencil, Trash2 } from "lucide-react"

export interface Column<T> {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T extends { id: number }> {
  columns: Column<T>[]
  data: T[]
  onDelete?: (item: T) => void
  onEdit?: (item: T) => void
}

export function DataTable<T extends { id: number }>({
  columns,
  data,
  onDelete,
  onEdit,
}: DataTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col.key}>{col.label}</TableHead>
          ))}
          {(onEdit || onDelete) && <TableHead>操作</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
              className="text-center py-10 text-muted-foreground"
            >
              暂无数据
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => (
            <TableRow key={item.id}>
              {columns.map((col) => (
                <TableCell key={col.key}>
                  {col.render
                    ? col.render(item)
                    : String((item as Record<string, unknown>)[col.key] ?? "")}
                </TableCell>
              ))}
              {(onEdit || onDelete) && (
                <TableCell>
                  <div className="flex items-center gap-1">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onEdit(item)}
                        aria-label={`编辑 ID ${item.id}`}
                      >
                        <Pencil />
                      </Button>
                    )}
                    {onDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`删除 ID ${item.id}`}>
                            <Trash2 className="text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>确认删除</AlertDialogTitle>
                            <AlertDialogDescription>
                              此操作不可撤销，确定要删除吗？
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => onDelete(item)}
                            >
                              删除
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
