"use client"

import type React from "react"

import { Navegacion } from "@/components/comunes/navegacion"
import { Breadcrumbs } from "@/components/comunes/breadcrumbs"
import { PiePagina } from "@/components/comunes/pie-pagina"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, CreditCard, Shield, MapPin, CheckCircle, Phone, Mail, User } from "lucide-react"
import { useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { crearReserva } from "@/api/reservas"
import { useToast } from "@/hooks/use-toast"
import useAuth from "@/hooks/useAuth"

/* ---------- Tipos fuertes para el estado ---------- */
interface DatosReserva {
  nombre: string
  apellido: string
  email: string
  telefono: string
  fechaNacimiento: string
  numeroPersonas: string
  fechaSalida: string
  solicitudesEspeciales: string
  aceptaTerminos: boolean
  aceptaMarketing: boolean
}

export default function PaginaReserva() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [datosReserva, setDatosReserva] = useState<DatosReserva>({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    fechaNacimiento: "",
    numeroPersonas: "1",
    fechaSalida: "",
    solicitudesEspeciales: "",
    aceptaTerminos: false,
    aceptaMarketing: false,
  })

  const [procesandoReserva, setProcesandoReserva] = useState(false)
  const [reservaCompletada, setReservaCompletada] = useState(false)
  const [numeroReserva, setNumeroReserva] = useState("")

  const nombrePaquete = searchParams?.get("nombre") || "Paquete seleccionado"
  const precioPaquete = searchParams?.get("precio") || "$0"
  const paqueteId = searchParams?.get("id") || null

  // Fecha mínima para la salida (evita recalcular en cada render)
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], [])

  /* ---------- Actualizador tipado por clave ---------- */
  const manejarCambio = <K extends keyof DatosReserva>(campo: K, valor: DatosReserva[K]) => {
    setDatosReserva((prev) => ({ ...prev, [campo]: valor }))
  }

  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validaciones básicas
    if (!datosReserva.aceptaTerminos) {
      toast({
        title: "Error",
        description: "Debes aceptar los términos y condiciones para continuar",
        variant: "destructive",
      })
      return
    }

    // Validar campos requeridos
    const camposRequeridos = [
      { campo: datosReserva.nombre, nombre: "Nombre" },
      { campo: datosReserva.apellido, nombre: "Apellido" },
      { campo: datosReserva.email, nombre: "Email" },
      { campo: datosReserva.telefono, nombre: "Teléfono" },
      { campo: datosReserva.fechaSalida, nombre: "Fecha de salida" },
    ]

    for (const { campo, nombre } of camposRequeridos) {
      if (!campo.trim()) {
        toast({
          title: "Campo requerido",
          description: `El campo ${nombre} es obligatorio`,
          variant: "destructive",
        })
        return
      }
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(datosReserva.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      })
      return
    }

    // Verificar que el usuario esté autenticado
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para realizar una reserva",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setProcesandoReserva(true)

    try {
      // Calcular precio total
      const precioUnitario = parseFloat(precioPaquete.replace("$", ""))
      const total = precioUnitario * parseInt(datosReserva.numeroPersonas)

      // Preparar datos para el backend según la estructura esperada
      // Preparar datos de la reserva para el backend
      // NOTA: Acompañantes comentados hasta que el backend los soporte correctamente
      const acompanantesData = Array.from({ length: Math.max(0, parseInt(datosReserva.numeroPersonas) - 1) }, (_, index) => ({
        nombre: `Acompañante ${index + 1}`,
        apellido: "",
        fecha_nacimiento: "1990-01-01"
      }));

      const reservaData = {
        fecha_inicio: datosReserva.fechaSalida,
        estado: "PENDIENTE",
        total: total.toString(),
        detalles: [
          {
            servicio: 1, // ID del servicio (puedes ajustar según sea necesario)
            tipo: "Turismo",
            titulo: nombrePaquete,
            precio_unitario: precioUnitario.toString(),
            cantidad: parseInt(datosReserva.numeroPersonas),
            fecha_servicio: datosReserva.fechaSalida + "T09:00:00-04:00"
          }
        ],
        // ACOMPAÑANTES DESHABILITADOS TEMPORALMENTE
        // Motivo: El backend tiene problemas con la validación de acompañantes
        // Para habilitar en el futuro, descomentar la siguiente línea:
        // acompanantes: acompanantesData,
        notas: datosReserva.solicitudesEspeciales || ""
      }

      console.log("📝 Enviando reserva:", reservaData)
      console.log("🧪 NOTA: Enviando SIN acompañantes (basado en problema identificado en edición)")
      console.log("🔄 ESTRUCTURA: Usando formato de detalles simplificado que funciona en admin")

      const response = await crearReserva(reservaData)
      
      console.log("✅ Reserva creada exitosamente:", response.data)
      
      // Generar número de reserva
      const numeroReservaGenerado = `BOL-${response.data.id || Date.now()}`
      setNumeroReserva(numeroReservaGenerado)
      
      setReservaCompletada(true)
      
      toast({
        title: "¡Reserva Confirmada!",
        description: `Tu reserva ${numeroReservaGenerado} ha sido creada exitosamente`,
      })
      
    } catch (error: any) {
      console.error("❌ Error al crear reserva:", error)
      console.error("❌ Respuesta del servidor:", error.response?.data)
      console.error("❌ Status code:", error.response?.status)
      
      // Mostrar error específico del backend si está disponible
      let mensajeError = "Ha ocurrido un error inesperado";
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          mensajeError = error.response.data;
        } else if (error.response.data.message) {
          mensajeError = error.response.data.message;
        } else if (error.response.data.detail) {
          mensajeError = error.response.data.detail;
        } else {
          // Mostrar errores de validación específicos
          const errores = Object.entries(error.response.data)
            .map(([campo, mensajes]) => {
              if (Array.isArray(mensajes)) {
                return `${campo}: ${mensajes.join(', ')}`;
              }
              return `${campo}: ${mensajes}`;
            })
            .join('\n');
          mensajeError = errores || "Error de validación en el backend";
        }
      }
      
      toast({
        title: "Error al procesar reserva",
        description: mensajeError,
        variant: "destructive",
      })
    } finally {
      setProcesandoReserva(false)
    }
  }

  if (reservaCompletada) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <Navegacion />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-bounce-in">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6 animate-pulse" />
            <h1 className="font-heading font-bold text-3xl text-foreground mb-4">¡Reserva Confirmada!</h1>
            <p className="text-muted-foreground mb-6">
              Tu reserva para <strong>{nombrePaquete}</strong> ha sido procesada exitosamente. Recibirás un email de
              confirmación en los próximos minutos.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                <strong>Número de reserva:</strong> {numeroReserva || `BOL-${Date.now()}`}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Estado:</strong> Pendiente de confirmación
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => router.push("/paquetes")}>Ver más paquetes</Button>
              <Button variant="outline" onClick={() => router.push("/")}>
                Volver al inicio
              </Button>
            </div>
          </div>
        </div>
        <PiePagina />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <Navegacion />
      <Breadcrumbs />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="font-heading font-black text-3xl lg:text-4xl text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Completa tu Reserva
          </h1>
          <p className="text-muted-foreground">Estás a un paso de vivir una experiencia inolvidable en Bolivia</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de reserva */}
          <div className="lg:col-span-2">
            <form onSubmit={manejarEnvio} className="space-y-6">
              {/* Información personal */}
              <Card className="animate-fade-in-up hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <User className="h-5 w-5 mr-2" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="animate-slide-right">
                      <Label htmlFor="nombre">Nombre *</Label>
                      <Input
                        id="nombre"
                        value={datosReserva.nombre}
                        onChange={(e) => manejarCambio("nombre", e.target.value)}
                        required
                        className="focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="animate-slide-left">
                      <Label htmlFor="apellido">Apellido *</Label>
                      <Input
                        id="apellido"
                        value={datosReserva.apellido}
                        onChange={(e) => manejarCambio("apellido", e.target.value)}
                        required
                        className="focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="animate-fade-in-up animation-delay-200">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={datosReserva.email}
                        onChange={(e) => manejarCambio("email", e.target.value)}
                        required
                        className="focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="animate-fade-in-up animation-delay-300">
                      <Label htmlFor="telefono">Teléfono *</Label>
                      <Input
                        id="telefono"
                        type="tel"
                        value={datosReserva.telefono}
                        onChange={(e) => manejarCambio("telefono", e.target.value)}
                        required
                        className="focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="animate-fade-in-up animation-delay-400">
                    <Label htmlFor="fechaNacimiento">Fecha de nacimiento *</Label>
                    <Input
                      id="fechaNacimiento"
                      type="date"
                      value={datosReserva.fechaNacimiento}
                      onChange={(e) => manejarCambio("fechaNacimiento", e.target.value)}
                      required
                      className="focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Detalles del viaje */}
              <Card className="animate-fade-in-up animation-delay-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <Calendar className="h-5 w-5 mr-2" />
                    Detalles del Viaje
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="animate-slide-right">
                      <Label htmlFor="numeroPersonas">Número de personas *</Label>
                      <Select
                        value={datosReserva.numeroPersonas}
                        onValueChange={(value) => manejarCambio("numeroPersonas", value)}
                      >
                        <SelectTrigger className="focus:ring-2 focus:ring-primary/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 persona</SelectItem>
                          <SelectItem value="2">2 personas</SelectItem>
                          <SelectItem value="3">3 personas</SelectItem>
                          <SelectItem value="4">4 personas</SelectItem>
                          <SelectItem value="5">5 personas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="animate-slide-left">
                      <Label htmlFor="fechaSalida">Fecha de salida *</Label>
                      <Input
                        id="fechaSalida"
                        type="date"
                        value={datosReserva.fechaSalida}
                        onChange={(e) => manejarCambio("fechaSalida", e.target.value)}
                        required
                        min={todayStr}
                        className="focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="animate-fade-in-up animation-delay-300">
                    <Label htmlFor="solicitudesEspeciales">Solicitudes especiales</Label>
                    <Textarea
                      id="solicitudesEspeciales"
                      value={datosReserva.solicitudesEspeciales}
                      onChange={(e) => manejarCambio("solicitudesEspeciales", e.target.value)}
                      placeholder="Alergias alimentarias, necesidades especiales, celebraciones..."
                      className="focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Términos y condiciones */}
              <Card className="animate-fade-in-up animation-delay-400 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terminos"
                      checked={datosReserva.aceptaTerminos}
                      onCheckedChange={(checked) => manejarCambio("aceptaTerminos", Boolean(checked))}
                      className="mt-1"
                    />
                    <Label htmlFor="terminos" className="text-sm leading-relaxed">
                      Acepto los{" "}
                      <span className="text-primary hover:underline cursor-pointer">términos y condiciones</span> y la{" "}
                      <span className="text-primary hover:underline cursor-pointer">política de privacidad</span> *
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="marketing"
                      checked={datosReserva.aceptaMarketing}
                      onCheckedChange={(checked) => manejarCambio("aceptaMarketing", Boolean(checked))}
                      className="mt-1"
                    />
                    <Label htmlFor="marketing" className="text-sm leading-relaxed">
                      Deseo recibir ofertas especiales y noticias sobre destinos bolivianos
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                disabled={procesandoReserva}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-4 text-lg hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl animate-fade-in-up animation-delay-500"
              >
                {procesandoReserva ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Procesando reserva...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Confirmar reserva
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Resumen de reserva */}
          <div className="space-y-6">
            <Card className="lg:sticky lg:top-24 z-20 bg-white shadow-xl animate-fade-in-up animation-delay-300 hover:shadow-2xl transition-all duration-300 border-2 border-primary/10">
              <CardHeader>
                <CardTitle className="text-primary">Resumen de Reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="animate-fade-in-up">
                  <h3 className="font-semibold text-lg">{nombrePaquete}</h3>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>Multi-destino</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2 animate-fade-in-up animation-delay-200">
                  <div className="flex justify-between">
                    <span>Precio por persona</span>
                    <span className="font-semibold">{precioPaquete}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Número de personas</span>
                    <span>{datosReserva.numeroPersonas}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">
                      $
                      {Number.parseFloat(precioPaquete.replace("$", "")) *
                        Number.parseInt(datosReserva.numeroPersonas)}
                    </span>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 animate-fade-in-up animation-delay-400">
                  <div className="flex items-center space-x-2 text-green-700">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Reserva segura</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Solo pagas $100 ahora. El resto 30 días antes del viaje.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Información de contacto */}
            <Card className="animate-fade-in-up animation-delay-500 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">¿Necesitas ayuda?</h3>
                <p className="text-sm text-muted-foreground mb-4">Nuestro equipo está disponible 24/7</p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full hover:scale-105 transition-all duration-200 bg-transparent"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    +591 2 123-4567
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full hover:scale-105 transition-all duration-200 bg-transparent"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    reservas@descubrebolivia.com
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <PiePagina />
    </div>
  )
}
