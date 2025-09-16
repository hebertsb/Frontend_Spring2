'use client'

import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, User, Filter, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Datos de ejemplo para las reservas (posteriormente se conectará con el backend)
const mockReservations = [
  {
    id: 1,
    destino: "Salar de Uyuni",
    fechaReserva: "2024-01-15",
    fechaViaje: "2024-03-20",
    estado: "Confirmada",
    precio: 450.00,
    duracion: "3 días / 2 noches",
    huespedes: 2,
    imagen: "/salar-de-uyuni-atardecer.png"
  },
  {
    id: 2,
    destino: "Lago Titicaca",
    fechaReserva: "2024-02-10",
    fechaViaje: "2024-04-15",
    estado: "Pendiente",
    precio: 320.00,
    duracion: "2 días / 1 noche",
    huespedes: 3,
    imagen: "/lago-titicaca-bolivia-panorama.png"
  },
  {
    id: 3,
    destino: "Madidi Amazon",
    fechaReserva: "2024-01-05",
    fechaViaje: "2024-02-28",
    estado: "Completada",
    precio: 680.00,
    duracion: "5 días / 4 noches",
    huespedes: 1,
    imagen: "/madidi-amazon-rainforest.png"
  }
];

const ClientReservations = () => {
  const [reservations, setReservations] = useState(mockReservations);
  const [filtro, setFiltro] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);

  // Filtrar reservas según estado y búsqueda
  const reservasFiltradas = reservations.filter(reserva => {
    const cumpleFiltro = filtro === "todas" || reserva.estado.toLowerCase() === filtro.toLowerCase();
    const cumpleBusqueda = reserva.destino.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleFiltro && cumpleBusqueda;
  });

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "confirmada":
        return "bg-green-100 text-green-800 border-green-200";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completada":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelada":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mis Reservas
        </h1>
        <p className="text-gray-600">
          Gestiona y revisa todas tus reservas de viaje
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por destino..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filtro por estado */}
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todas">Todas</option>
              <option value="confirmada">Confirmadas</option>
              <option value="pendiente">Pendientes</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de reservas */}
      <div className="grid gap-6">
        {reservasFiltradas.length > 0 ? (
          reservasFiltradas.map((reserva) => (
            <div key={reserva.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row">
                {/* Imagen */}
                <div className="md:w-64 h-48 md:h-auto">
                  <img
                    src={reserva.imagen}
                    alt={reserva.destino}
                    className="w-full h-full object-cover rounded-t-xl md:rounded-l-xl md:rounded-t-none"
                  />
                </div>

                {/* Contenido */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {reserva.destino}
                      </h3>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getEstadoColor(reserva.estado)}`}>
                        {reserva.estado}
                      </div>
                    </div>
                    <div className="text-right mt-4 md:mt-0">
                      <div className="text-2xl font-bold text-blue-600">
                        ${reserva.precio.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">USD</div>
                    </div>
                  </div>

                  {/* Detalles */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <div>
                        <div className="text-xs text-gray-500">Fecha de viaje</div>
                        <div className="text-sm font-medium">{formatFecha(reserva.fechaViaje)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <div>
                        <div className="text-xs text-gray-500">Duración</div>
                        <div className="text-sm font-medium">{reserva.duracion}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <div>
                        <div className="text-xs text-gray-500">Huéspedes</div>
                        <div className="text-sm font-medium">{reserva.huespedes} persona{reserva.huespedes > 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  </div>

                  {/* Fecha de reserva */}
                  <div className="text-xs text-gray-500 mb-4">
                    Reservado el {formatFecha(reserva.fechaReserva)}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      Ver Detalles
                    </button>
                    {reserva.estado === "Confirmada" && (
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                        Modificar
                      </button>
                    )}
                    {(reserva.estado === "Confirmada" || reserva.estado === "Pendiente") && (
                      <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes reservas
            </h3>
            <p className="text-gray-500 mb-6">
              {busqueda || filtro !== "todas" 
                ? "No se encontraron reservas con los filtros aplicados"
                : "Aún no has realizado ninguna reserva. ¡Explora nuestros destinos!"
              }
            </p>
            <button 
              onClick={() => window.location.href = '/destinos'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Explorar Destinos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientReservations;