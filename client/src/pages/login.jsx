import React, { useState } from 'react';
import axios from 'axios';
import logoKantra from '../assets/logo-kantra.png';
import logoGoogle from '../assets/logo-google.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      const response = await axios.post(`${apiUrl}/auth/login`, {
        email: email,
        password: password
      });
      console.log("Login Berhasil:", response.data);
      alert("Login Berhasil!");
    } catch (error) {
      console.error("Gagal Login:", error.response?.data || error.message);
      alert("Login gagal, cek konsol!");
    }
  };

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        width: '100vw', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#0a0a0c',
        margin: 0,
        padding: 0,
        position: 'fixed',
        top: 0,
        left: 0
      }}
    >
      
      <style>{`
        .custom-input {
          color: rgba(255, 255, 255, 0.5) !important;
          font-size: 11px !important;
          font-weight: bold !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .custom-input::placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
        }
        .custom-input:focus {
          border: 1px solid #7B61FF !important; 
        }
      `}</style>

      {/* KARTU LOGIN DENGAN WARNA 1A1A24 DAN SHADOW BARU */}
      <div 
        className="flex flex-col items-center"
        style={{
          width: '297px', 
          height: '363px',
          backgroundColor: '#1A1A24', // <--- Warna card diubah
          borderRadius: '28px',
          // Shadow: Blur 25, Spread 10, Warna 7B61FF
          boxShadow: '0px 0px 25px 10px #7B61FF', 
          paddingTop: '10px', 
          paddingLeft: '25.5px', 
          paddingRight: '25.5px', 
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
        
        {/* Logo */}
        <div className="flex flex-col items-center w-full" style={{ marginBottom: '7px' }}>
          <img 
            src={logoKantra} 
            alt="Logo Kantra" 
            className="h-11 w-auto" 
          />
        </div>

        {/* Form Login */}
        <form onSubmit={handleLogin} className="w-full m-0 p-0 flex flex-col items-center">
          
          {/* Input Email */}
          <div className="w-full flex justify-center" style={{ marginBottom: '2px' }}>
            <input 
              type="email" 
              placeholder="Email"
              className="px-4 custom-input"
              style={{ 
                width: '246px', 
                height: '28px', 
                backgroundColor: '#1A1A24', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: '10px',
                boxSizing: 'border-box' 
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          {/* Input Password */}
          <div className="w-full flex justify-center">
            <input 
              type="password" 
              placeholder="Password"
              className="px-4 custom-input"
              style={{ 
                width: '246px', 
                height: '28px', 
                backgroundColor: '#1A1A24', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: '10px',
                boxSizing: 'border-box' 
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Lupa Password */}
          <div 
            style={{ 
              width: '246px', 
              display: 'flex', 
              justifyContent: 'flex-end', 
              marginTop: '2px', 
              marginBottom: '15px' 
            }}
          >
            <a 
              href="#" 
              style={{ fontSize: '10px', color: '#9ca3af', textDecoration: 'none' }}
              className="hover:text-white transition-colors"
            >
              Forgot your password?
            </a>
          </div>

          {/* Tombol Login */}
          <button 
            type="submit"
            style={{ 
              width: '246px', 
              height: '28px', 
              backgroundColor: '#7B61FF',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              marginBottom: '12px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxSizing: 'border-box',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
        </form>

        {/* Garis Pemisah "or" */}
        <div 
          style={{ 
            width: '246px', 
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: '10px' 
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: '#3f3f46' }}></div>
          <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500', margin: '0 16px' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#3f3f46' }}></div>
        </div>

        {/* Tombol Google */}
        <button 
          type="button"
          style={{ 
            width: '30px',
            height: '30px',
            backgroundColor: '#FFFFFF',
            borderRadius: '50%',
            border: 'none', 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            margin: '0 auto 15px auto'
          }}
        >
          <img 
            src={logoGoogle} 
            alt="Login with Google" 
            style={{ width: '16px', height: '16px', objectFit: 'contain' }} 
          />
        </button>

        {/* Link Daftar */}
        <div 
          style={{ 
            display: 'flex',
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '11px', 
            fontWeight: 'bold', 
            gap: '4px' 
          }}
        >
          <span style={{ color: '#FFFFFF' }}>Belum punya akun?</span> 
          <a 
            href="/register" 
            style={{ color: '#7B61FF', textDecoration: 'none' }}
          >
            Daftar
          </a>
        </div>

      </div>
    </div>
  );
};

export default Login;