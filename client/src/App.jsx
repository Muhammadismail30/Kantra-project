import { useEffect, useState } from 'react'

function App() {
  const [message, setMessage] = useState('Sedang menghubungkan ke API...')
  const [error, setError] = useState(null)

  useEffect(() => {
    // Memanggil API yang kita buat di Express tadi
    fetch('http://localhost:5000/api/test')
      .then((res) => {
        if (!res.ok) throw new Error('Gagal konek ke server')
        return res.json()
      })
      .then((data) => setMessage(data.message))
      .catch((err) => {
        setError(err.message)
        console.error("Error:", err)
      })
  }, [])

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Web Engineering Project</h1>
      <div style={{ 
        padding: '10px', 
        border: '1px solid #ccc', 
        display: 'inline-block',
        backgroundColor: error ? '#ffebee' : '#e8f5e9'
      }}>
        <strong>Status API: </strong> 
        {error ? <span style={{color: 'red'}}>{error}</span> : <span>{message}</span>}
      </div>
    </div>
  )
}

export default App