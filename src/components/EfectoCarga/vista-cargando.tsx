"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLoadingLink } from "./contexto"

type LoadingLinkProps = {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void   // 👈 aceptamos un onClick opcional
}

export function LoadingLink({ href, children, className, onClick }: LoadingLinkProps) {
  const router = useRouter()
  const { activeHref, setActiveHref } = useLoadingLink()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setActiveHref(href)   // 🔥 activa el botón
    router.push(href)     // cambia de página

    if (onClick) onClick() // 👈 ejecutamos también el onClick externo
  }

  const isActive = activeHref === href

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`relative flex items-center gap-2 ${className}`}
    >
      {children}
      {isActive && (
        <span className="w-4 h-4 border-2 border-t-transparent border-primary rounded-full animate-spin"></span>
      )}
    </Link>
  )
}
