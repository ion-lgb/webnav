import { redirect } from "next/navigation"

export default function PopularPage() {
  redirect("/explore?sort=popular")
}
