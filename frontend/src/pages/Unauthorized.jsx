import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-xl text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 animate-pulse">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Access Denied</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          You are not authorized to view this page. Your role does not have the required permissions to access this route.
        </p>
        <div className="pt-4">
          <Link
            to="/"
            className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
