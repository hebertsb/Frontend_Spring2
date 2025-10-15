export default function PagoExitoso() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="flex items-center justify-center mb-4">
          <span className="text-4xl text-green-600">✅</span>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-green-700">¡Pago realizado con éxito!</h1>
        <p className="mb-4 text-gray-700">Gracias por tu pago. Tu reserva ha sido confirmada.</p>
        <p className="mb-6 text-gray-500 text-sm">Revisa tu correo para ver el comprobante y los detalles de tu reserva.</p>
        <a href="/panel" className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition">Ir a mi panel</a>
      </div>
    </div>
  );
}
