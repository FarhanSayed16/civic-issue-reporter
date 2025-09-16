// src/components/MainLayout.jsx
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Header, Loader } from '../components'; // Assuming Loader is also a component
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Toaster } from "@/components/ui/sonner"

const MainLayout = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-neutral-100">
      <Toaster richColors />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-6 bg-neutral-100 pt-16">
            <Outlet/>
          </main>
          <Footer/>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;