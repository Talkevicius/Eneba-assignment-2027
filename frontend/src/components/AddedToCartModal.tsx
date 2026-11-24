import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../cart/CartProvider'
import './AddedToCartModal.css'

export default function AddedToCartModal() {
  const { isAddToCartModalOpen, totalQuantity, closeAddToCartModal } = useCart()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isAddToCartModalOpen && !dialog.open) dialog.showModal()
    if (!isAddToCartModalOpen && dialog.open) dialog.close()
  }, [isAddToCartModalOpen])

  return (
    <dialog
      ref={dialogRef}
      className="modal add-to-cart-modal"
      aria-labelledby="added-to-cart-title"
      aria-modal="true"
      onClose={closeAddToCartModal}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeAddToCartModal()
      }}
    >
      <button className="add-to-cart-close" type="button" aria-label="Close" onClick={closeAddToCartModal}>×</button>
      <svg className="add-to-cart-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M8 12h7l6 29h28l7-21H19" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="26" cy="51" r="4" fill="currentColor" />
        <circle cx="46" cy="51" r="4" fill="currentColor" />
        <path d="m31 21 5 5 10-11" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h2 id="added-to-cart-title">Added to cart!</h2>
      <p className="add-to-cart-quantity">
        {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} in your cart
      </p>
      <div className="add-to-cart-actions">
        <Link className="button button-primary" to="/cart" onClick={closeAddToCartModal}>View Cart</Link>
        <button className="button button-secondary" type="button" onClick={closeAddToCartModal}>Continue Shopping</button>
      </div>
    </dialog>
  )
}
