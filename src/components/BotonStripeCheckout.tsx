import axios from '../api/axios';
import React from 'react';

interface BotonStripeCheckoutProps {
  monto: number;
  descripcion: string;
}

const BotonStripeCheckout: React.FC<BotonStripeCheckoutProps> = ({ monto, descripcion }: BotonStripeCheckoutProps) => {
  const handleCheckout = async () => {
    try {
      const response = await axios.post('/crear-checkout-session/', {
        amount: monto * 100, // Stripe espera centavos
        currency: 'bob',
        description: descripcion,
        success_url: window.location.origin + '/pago-exitoso',
        cancel_url: window.location.origin + '/pago-cancelado',
      });
      window.location.href = response.data.checkout_url;
    } catch (error) {
      alert('Error al iniciar el pago con Stripe.');
      console.error(error);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
    >
      Ir a pagar con Stripe (Checkout)
    </button>
  );
};

export default BotonStripeCheckout;
