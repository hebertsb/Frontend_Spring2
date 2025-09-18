"use client"

import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"
import Link from "next/link"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Usuario",
    email: "usuario@example.com",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    { title: "Dashboard", url: "/panel", icon: IconDashboard },
    { title: "Gestión de usuarios", url: "/panel?tab=usuarios", icon: IconUsers },
    { title: "Gestión de reservas", url: "/panel?tab=reservas", icon: IconListDetails },
    { title: "Cupones y descuentos", url: "#", icon: IconListDetails },
    { title: "Gestión de informes", url: "#", icon: IconChartBar },
   // { title: "Projects", url: "#", icon: IconFolder },
    
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        { title: "Active Proposals", url: "#" },
        { title: "Archived", url: "#" },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        { title: "Active Proposals", url: "#" },
        { title: "Archived", url: "#" },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        { title: "Active Proposals", url: "#" },
        { title: "Archived", url: "#" },
      ],
    },
  ],
  navSecondary: [
    { title: "Configuración", url: "#", icon: IconSettings },
    { title: "Obtén ayuda", url: "#", icon: IconHelp },
    { title: "Buscar", url: "#", icon: IconSearch },
  ],
  documents: [
    { name: "Biblioteca de Datos", url: "#", icon: IconDatabase },
    { name: "Informes", url: "#", icon: IconReport },
    //{ name: "Asistente de Word", url: "#", icon: IconFileWord },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Eliminado: user no se usa
  
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
  // Línea eliminada: user no se usa
            >
              {/* ✅ Link en lugar de <a> */}
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Volver al inicio</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        {/* Temporalmente oculto para encontrar el elemento S */}
        {/* {user && <NavUser user={user} />} */}
      </SidebarFooter>
    </Sidebar>
  )
}
