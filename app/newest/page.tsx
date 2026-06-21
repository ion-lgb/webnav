import { redirect } from "next/navigation"

export default function NewestPage() {
  redirect("/explore?sort=newest")
}
