"use client"
import React, { useState, useEffect } from "react";
import { getUser, updateUserProfile, UpdateUserData } from "@/api/auth";
import { useToast } from "@/hooks/use-toast";

const ClientDashboard = () => {
  const [user, setUser] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    fecha_nacimiento: "",
    genero: "",
    documento_identidad: "",
    pais: ""
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Función auxiliar para formatear fecha para input de tipo date
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    
    // Si la fecha contiene 'T' (formato ISO), tomar solo la parte de la fecha
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    
    // Si ya está en formato YYYY-MM-DD, devolverla tal como está
    return dateString;
  };

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getUser();
        // Asegurar que todos los campos tengan valores válidos
        const userData = {
          nombres: response.data.nombres || "",
          apellidos: response.data.apellidos || "",
          email: response.data.email || "",
          telefono: response.data.telefono || "",
          fecha_nacimiento: response.data.fecha_nacimiento || "",
          genero: response.data.genero || "",
          documento_identidad: response.data.documento_identidad || "",
          pais: response.data.pais || ""
        };
        setUser(userData);
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del usuario",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [toast]);

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  // Guardar cambios
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData: UpdateUserData = {
        nombres: user.nombres,
        apellidos: user.apellidos,
        telefono: user.telefono,
        fecha_nacimiento: user.fecha_nacimiento,
        genero: user.genero,
        documento_identidad: user.documento_identidad,
        pais: user.pais,
      };

      const response = await updateUserProfile(updateData);
      setUser(response.data);
      setEditMode(false);
      
      toast({
        title: "✅ Perfil actualizado",
        description: "Tus datos han sido actualizados correctamente",
      });
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      toast({
        title: "❌ Error",
        description: "No se pudo actualizar tu perfil. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto mt-10 bg-white rounded-xl shadow p-6">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Mi Perfil</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nombres</label>
          <input
            type="text"
            name="nombres"
            value={user.nombres}
            onChange={handleInputChange}
            disabled={!editMode}
            className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition bg-gray-100 disabled:opacity-70"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Apellidos</label>
          <input
            type="text"
            name="apellidos"
            value={user.apellidos}
            onChange={handleInputChange}
            disabled={!editMode}
            className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition bg-gray-100 disabled:opacity-70"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Correo electrónico</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full border border-blue-200 rounded-lg px-4 py-2 bg-gray-100 opacity-80"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={user.telefono}
            onChange={handleInputChange}
            disabled={!editMode}
            className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition bg-gray-100 disabled:opacity-70"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de nacimiento</label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={formatDateForInput(user.fecha_nacimiento)}
            onChange={handleInputChange}
            disabled={!editMode}
            className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition bg-gray-100 disabled:opacity-70"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Género</label>
          {editMode ? (
            <select
              name="genero"
              value={user.genero}
              onChange={handleInputChange}
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            >
              <option value="">Selecciona género</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
          ) : (
            <input
              type="text"
              value={user.genero === "M" ? "Masculino" : user.genero === "F" ? "Femenino" : user.genero === "O" ? "Otro" : user.genero}
              disabled
              className="w-full border border-blue-200 rounded-lg px-4 py-2 bg-gray-100 disabled:opacity-70"
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Documento de identidad</label>
          <input
            type="text"
            name="documento_identidad"
            value={user.documento_identidad}
            onChange={handleInputChange}
            disabled={!editMode}
            className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition bg-gray-100 disabled:opacity-70"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">País</label>
          <input
            type="text"
            name="pais"
            value={user.pais}
            onChange={handleInputChange}
            disabled={!editMode}
            className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition bg-gray-100 disabled:opacity-70"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          {!editMode && (
            <button
              type="button"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold shadow hover:bg-blue-700 transition"
              onClick={() => setEditMode(true)}
            >
              Editar
            </button>
          )}
          {editMode && (
            <>
              <button
                type="button"
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                onClick={() => setEditMode(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-bold shadow hover:from-blue-600 hover:to-blue-800 transition"
              >
                Guardar
              </button>
            </>
          )}
        </div>
      </form>
      <div className="flex justify-end mt-4">
        <a
          href="/cliente/cambiar-password"
          className="text-blue-600 underline text-sm hover:text-blue-800"
        >
          Cambiar contraseña
        </a>
      </div>
    </div>
  );
};

export default ClientDashboard;
