'use client';

import React from 'react';
import { useAuth } from '@/context/auth-context';

/**
 * Dashboard de administración
 */
export default function AdminDashboard() {
  const { userAttributes, isAdmin } = useAuth();
  
  const name = userAttributes?.givenName || userAttributes?.name || 'Administrador';
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Bienvenido, {name}</h1>
        <p className="text-gray-600">
          Has iniciado sesión correctamente en el panel de administración.
        </p>
        
        {isAdmin && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
            Tienes privilegios de administrador.
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta de estadísticas: Usuarios */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Usuarios totales</h3>
            <span className="text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-bold">123</div>
          <div className="text-sm text-gray-500 mt-2">+5% desde el mes pasado</div>
        </div>
        
        {/* Tarjeta de estadísticas: Visitas */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Visitas esta semana</h3>
            <span className="text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-bold">584</div>
          <div className="text-sm text-gray-500 mt-2">+12% desde la semana pasada</div>
        </div>
        
        {/* Tarjeta de estadísticas: Contenido */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Contenido publicado</h3>
            <span className="text-purple-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-bold">42</div>
          <div className="text-sm text-gray-500 mt-2">+3 desde la semana pasada</div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Información del Sistema</h2>
        
        <table className="w-full">
          <tbody>
            <tr className="border-b">
              <td className="py-2 font-medium">Estado</td>
              <td className="py-2 text-right">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Activo
                </span>
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-medium">Última actualización</td>
              <td className="py-2 text-right">{new Date().toLocaleString()}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-medium">Versión</td>
              <td className="py-2 text-right">1.0.0</td>
            </tr>
            <tr>
              <td className="py-2 font-medium">Proveedor de autenticación</td>
              <td className="py-2 text-right">AWS Cognito</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
