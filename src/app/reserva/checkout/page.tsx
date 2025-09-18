"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { apiFetch } from "@/lib/api"

export default function CheckoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<"form" | "checkup" | "done">("form")

  // Estado de la reserva
  const [reserva, setReserva] = useState({
    fecha_inicio: "2025-09-20T10:00:00",
    moneda: "BOB",
    detalles: [
      {
        servicio: 2,
        cantidad: 3,
        fecha_servicio: "2025-09-20T10:00:00",
      },
    ],
    acompanantes: [
      {
        acompanante: {
          documento: "",
          nombre: "",
          apellido: "",
          fecha_nacimiento: "",
          nacionalidad: "",
          email: "",
          telefono: "",
        },
        estado: "CONFIRMADO",
        es_titular: true,
      },
    ],
  })

  /* ---------- Helpers ---------- */
  const addAcompanante = () => {
    setReserva({
      ...reserva,
      acompanantes: [
        ...reserva.acompanantes,
        {
          acompanante: {
            documento: "",
            nombre: "",
            apellido: "",
            fecha_nacimiento: "",
            nacionalidad: "",
            email: "",
            telefono: "",
          },
          estado: "CONFIRMADO",
          es_titular: false,
        },
      ],
    })
  }

  const removeAcompanante = (index: number) => {
    setReserva({
      ...reserva,
      acompanantes: reserva.acompanantes.filter((_, i) => i !== index),
    })
  }

  const handleChange = (index: number, field: string, value: string) => {
    const updated = [...reserva.acompanantes]
    updated[index].acompanante = {
      ...updated[index].acompanante,
      [field]: value,
    }
    setReserva({ ...reserva, acompanantes: updated })
  }

  /* ---------- Checkup ---------- */
  const checkup = () => {
    const checks: { label: string; ok: boolean }[] = []
    const titular = reserva.acompanantes.find((a) => a.es_titular)

    // Titular completo
    checks.push({
      label: "Titular con datos completos",
      ok:
        !!titular &&
        titular.acompanante.nombre.trim() !== "" &&
        titular.acompanante.apellido.trim() !== "" &&
        titular.acompanante.documento.trim() !== "",
    })

    // Sin duplicados
    const documentos = reserva.acompanantes.map((a) => a.acompanante.documento)
    const duplicados = new Set(documentos).size !== documentos.length
    checks.push({ label: "Sin documentos duplicados", ok: !duplicados })

    // Fecha inicio
    checks.push({
      label: "Fecha de inicio válida",
      ok: Boolean(reserva.fecha_inicio),
    })

    // Servicios
    checks.push({
      label: "Servicios seleccionados",
      ok:
        reserva.detalles.length > 0 &&
        reserva.detalles.every((d) => d.servicio && d.cantidad > 0),
    })

    return checks
  }

  /* ---------- Envío al backend ---------- */
  const crearReserva = async () => {
  try {
    setLoading(true)
    const resp = await apiFetch("http://127.0.0.1:8000/api/reservas/", {
      method: "POST",
      body: JSON.stringify(reserva),
    })

    if (!resp.ok) {
      const err = await resp.json()
      alert("Error: " + JSON.stringify(err))
      return
    }

    alert("Reserva creada ✅")
    router.push("/perfil/reservas")
  } catch (e) {
    alert("⚠️ Error: " + e)
  } finally {
    setLoading(false)
  }
}

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      {step === "form" && (
        <>
          <h1 className="text-3xl font-bold mb-6">Datos de los Pasajeros</h1>

          {reserva.acompanantes.map((acomp, index) => (
            <Card key={index} className="mb-4">
              <CardHeader>
                <CardTitle>
                  {acomp.es_titular ? "Titular" : `Acompañante ${index}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre</Label>
                  <Input
                    value={acomp.acompanante.nombre}
                    onChange={(e) =>
                      handleChange(index, "nombre", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Apellido</Label>
                  <Input
                    value={acomp.acompanante.apellido}
                    onChange={(e) =>
                      handleChange(index, "apellido", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Documento</Label>
                  <Input
                    value={acomp.acompanante.documento}
                    onChange={(e) =>
                      handleChange(index, "documento", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Nacionalidad</Label>
                  <Input
                    value={acomp.acompanante.nacionalidad}
                    onChange={(e) =>
                      handleChange(index, "nacionalidad", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Fecha de nacimiento</Label>
                  <Input
                    type="date"
                    value={acomp.acompanante.fecha_nacimiento}
                    onChange={(e) =>
                      handleChange(index, "fecha_nacimiento", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={acomp.acompanante.email}
                    onChange={(e) =>
                      handleChange(index, "email", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    value={acomp.acompanante.telefono}
                    onChange={(e) =>
                      handleChange(index, "telefono", e.target.value)
                    }
                  />
                </div>
                {!acomp.es_titular && (
                  <Button
                    variant="destructive"
                    onClick={() => removeAcompanante(index)}
                  >
                    Eliminar
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}

          <Button
            onClick={addAcompanante}
            className="bg-green-500 text-white mb-6"
          >
            ➕ Añadir Acompañante
          </Button>

          <Button
            onClick={() => setStep("checkup")}
            className="bg-amber-500 text-white"
          >
            Continuar al Checkup
          </Button>
        </>
      )}

      {step === "checkup" && (
        <>
          <h1 className="text-3xl font-bold mb-6">Checkup de Reserva</h1>
          <ul className="space-y-3 mb-6">
            {checkup().map((c, i) => (
              <li
                key={i}
                className={`flex items-center ${
                  c.ok ? "text-green-600" : "text-red-600"
                }`}
              >
                {c.ok ? (
                  <CheckCircle2 className="mr-2" />
                ) : (
                  <AlertCircle className="mr-2" />
                )}
                {c.label}
              </li>
            ))}
          </ul>

          <Button onClick={() => setStep("form")} className="mr-3">
            🔙 Volver
          </Button>
          <Button
            onClick={crearReserva}
            disabled={loading}
            className="bg-blue-600 text-white"
          >
            {loading ? "Procesando..." : "Confirmar Reserva"}
          </Button>

          {error && (
            <p className="text-red-600 mt-4">❌ Error: {error}</p>
          )}
        </>
      )}

      {step === "done" && (
        <div className="text-center">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">¡Reserva confirmada!</h1>
          <p className="text-gray-600 mb-4">
            Los pasajeros han sido registrados correctamente.
          </p>
          <Button onClick={() => router.push("/perfil/reservas")}>
            Ir a Mis Reservas
          </Button>
        </div>
      )}
    </div>
  )
}
