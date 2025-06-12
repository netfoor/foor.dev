'use client'
import React from 'react';
import { signOut } from '@aws-amplify/auth';

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      // Cerrar sesión en Cognito / Amplify
      await signOut();

      // Limpiar localStorage y sessionStorage
      localStorage.clear();
      sessionStorage.clear();

      // Opcional: limpiar cookies manualmente (solo cookies del dominio actual)
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Recargar la página para iniciar desde cero
      window.location.reload();
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    }
  };

  return (
    <button onClick={handleLogout}>
      Cerrar sesión / Limpiar sesión
    </button>
  );
}
