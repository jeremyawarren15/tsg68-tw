import { ReactNode } from "react"

type Props = {
  children?: ReactNode
}
export default function LoggedInLayout({ children }: Props) {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      {children}
    </section>
  )
}
