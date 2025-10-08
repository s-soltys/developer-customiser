import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/admin/useAdminAuth';
import { AdminAuth } from '../../components/admin/AdminAuth';
import { CategoryList } from '../../components/admin/CategoryList';
import { QuestionList } from '../../components/admin/QuestionList';

type Tab = 'categories' | 'questions';

/**
 * Admin dashboard with category and question management.
 * Protected by authentication - shows login if not authenticated.
 */
export function AdminDashboard() {
  const { isAuthenticated, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<Tab>('categories');

  if (!isAuthenticated) {
    return <AdminAuth />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'questions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Questions
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'categories' && <CategoryList />}
        {activeTab === 'questions' && <QuestionList />}
      </main>
    </div>
  );
}
