"use client"
import ServerConnectionTest from '@/components/ServerConnectionTest';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white text-center">
          نظام إدارة قطع غيار السيارات
        </h1>
        <ServerConnectionTest />
      </div>
    </div>
  );
}
