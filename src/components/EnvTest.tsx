import React from 'react';

const EnvTest: React.FC = () => {
  const envVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Environment Variables Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Current Environment Variables:</h2>
          
          <div className="space-y-4">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium text-gray-700">{key}:</span>
                <span className="text-sm text-gray-600 max-w-md truncate">
                  {value ? (
                    key.includes('KEY') ? '***PRESENT***' : value
                  ) : (
                    <span className="text-red-600">❌ MISSING</span>
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Debug Info:</h3>
            <pre className="text-xs text-blue-700 overflow-auto">
              {JSON.stringify({
                allEnvKeys: Object.keys(import.meta.env),
                hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
                hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
                urlLength: import.meta.env.VITE_SUPABASE_URL?.length || 0,
                keyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvTest;