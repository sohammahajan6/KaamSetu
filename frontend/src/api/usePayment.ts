import { useMutation } from '@tanstack/react-query'
import { api } from '@/api'

/**
 * Razorpay Checkout integration hook.
 * Loads the Razorpay script on demand, creates an order via the backend,
 * opens the checkout, and verifies the payment on success.
 */
export function usePayment() {
  const createOrder = useMutation({
    mutationFn: (bookingId: string) =>
      fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('hyperlocal-jwt')}`,
        },
        body: JSON.stringify({ bookingId }),
      }).then((r) => r.json()),
  })

  const verifyPayment = useMutation({
    mutationFn: (data: {
      razorpayOrderId: string
      razorpayPaymentId: string
      razorpaySignature: string
    }) => fetch('/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('hyperlocal-jwt')}`,
      },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
  })

  const pay = async (bookingId: string, onSuccess?: () => void) => {
    // 1. Create order
    const order = await createOrder.mutateAsync(bookingId)
    if (!order.razorpayOrderId) throw new Error('Failed to create payment order')

    // 2. Load Razorpay script
    await loadRazorpayScript()

    // 3. Open Razorpay Checkout
    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: 'INR',
      name: 'KaamSetu',
      description: `Booking #${bookingId.slice(0, 8)}`,
      order_id: order.razorpayOrderId,
      handler: async (response: {
        razorpay_order_id: string
        razorpay_payment_id: string
        razorpay_signature: string
      }) => {
        // 4. Verify payment on backend
        await verifyPayment.mutateAsync({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        })
        onSuccess?.()
      },
      modal: {
        ondismiss: () => {
          // User closed the modal — do nothing
        },
      },
      theme: {
        color: '#e8a33d',
      },
      prefill: {
        contact: '',
        email: '',
      },
    }

    const rzp = new (window as any).Razorpay(options)
    rzp.open()
  }

  return { pay, createOrder, verifyPayment }
}

/** Load Razorpay's checkout script once. */
let scriptLoaded = false
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (scriptLoaded || (window as any).Razorpay) {
      scriptLoaded = true
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => {
      scriptLoaded = true
      resolve()
    }
    script.onerror = () => reject(new Error('Failed to load Razorpay Checkout'))
    document.body.appendChild(script)
  })
}
