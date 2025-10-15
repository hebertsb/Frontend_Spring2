"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";

export default function ChatTurismo() {
  const [abierto, setAbierto] = useState(false);
  const [pregunta, setPregunta] = useState("");
  const [mensajes, setMensajes] = useState<
    { tipo: "user" | "bot"; texto: string }[]
  >([]);
  const [cargando, setCargando] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando llega un nuevo mensaje
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensajes]);

  // 🔹 Función para detectar si hay un enlace en el texto del bot
  const renderMensaje = (texto: string) => {
    // Detecta URLs dentro del texto
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const partes = texto.split(urlRegex);

    return partes.map((parte, i) => {
      if (parte.match(urlRegex)) {
        return (
          <button
            key={i}
            onClick={() => (window.location.href = parte)} // 👈 redirige en la misma pestaña
            className="block mt-1 bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-lg transition-all duration-200"
          >
            👉 Ir al enlace
          </button>
        );
      }
      return <span key={i}>{parte}</span>;
    });
  };

  const enviar = async () => {
    if (!pregunta.trim()) return;

  const nuevoMensaje: { tipo: "user" | "bot"; texto: string } = { tipo: "user", texto: pregunta };
  setMensajes((prev) => [...prev, nuevoMensaje]);
    setPregunta("");
    setCargando(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chatbot/turismo/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pregunta }),
        }
      );

      const data = await res.json();
      const respuesta = data.respuesta || "No se pudo obtener respuesta 😅";
      setMensajes((prev) => [...prev, { tipo: "bot", texto: respuesta }]);
    } catch (error) {
      setMensajes((prev) => [
        ...prev,
        { tipo: "bot", texto: "⚠️ Error al conectar con el servidor." },
      ]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      {/* 🌟 Botón flotante */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center z-50"
      >
        {abierto ? <X size={22} /> : <MessageCircle size={26} />}
      </button>

      {/* 💬 Ventana de chat */}
      {abierto && (
        <div className="fixed bottom-20 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col h-[500px] overflow-hidden z-40 animate-fade-in border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-center py-3 font-semibold">
            Chat Turístico 🤖
          </div>

          {/* Área de mensajes */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          >
            {mensajes.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.tipo === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm leading-relaxed shadow-md ${
                    msg.tipo === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {renderMensaje(msg.texto)}
                </div>
              </div>
            ))}

            {cargando && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-2xl rounded-bl-none max-w-[70%] animate-pulse">
                  Escribiendo...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2 bg-white">
            <textarea
              rows={1}
              className="flex-1 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 resize-none"
              placeholder="Escribe tu pregunta..."
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && enviar()}
            />
            <button
              onClick={enviar}
              disabled={cargando}
              className={`px-4 py-2 rounded-lg text-white font-medium transition ${
                cargando
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Animación suave */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        /* Scrollbar bonita */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-thumb {
          background-color: #cbd5e0;
          border-radius: 3px;
        }
      `}</style>
    </>
  );
}
