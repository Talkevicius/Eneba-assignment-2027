import { useParams } from 'react-router-dom'

export default function PlaceholderPage({ title }: { title: string }) {
  const { slug, id } = useParams()
  return (
    <section className="page-placeholder">
      <h1>{title}</h1>
      {slug && <p>Product: {slug}</p>}
      {id && <p>Order: {id}</p>}
      <p>This page will be implemented in a later stage.</p>
    </section>
  )
}
