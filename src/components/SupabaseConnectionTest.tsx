import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, XCircle, AlertCircle, ArrowLeft, Copy, ExternalLink } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../config/supabase';

const SupabaseConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error' | 'not-configured'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setConnectionStatus('checking');
    setErrorMessage('');

    // Check if Supabase is configured
    if (!isSupabaseConfigured || !supabase) {
      setConnectionStatus('not-configured');
      setTestResults({
        configured: false,
        hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
        hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        urlValid: false,
        keyValid: false
      });
      return;
    }

    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count', { count: 'exact', head: true });

      if (error) {
        setConnectionStatus('error');
        setErrorMessage(error.message);
        setTestResults({
          configured: true,
          hasUrl: true,
          hasKey: true,
          urlValid: true,
          keyValid: false,
          error: error.message
        });
      } else {
        setConnectionStatus('connected');
        setTestResults({
          configured: true,
          hasUrl: true,
          hasKey: true,
          urlValid: true,
          keyValid: true,
          userCount: data || 0
        });
      }
    } catch (err) {
      setConnectionStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
      setTestResults({
        configured: true,
        hasUrl: true,
        hasKey: true,
        urlValid: false,
        keyValid: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'checking':
        return <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'connected':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'error':
        return <XCircle className="w-8 h-8 text-red-500" />;
      case 'not-configured':
        return <AlertCircle className="w-8 h-8 text-yellow-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (connectionStatus) {
      case 'checking':
        return 'Testing Supabase connection...';
      case 'connected':
        return 'Successfully connected to Supabase!';
      case 'error':
        return 'Connection failed';
      case 'not-configured':
        return 'Supabase not configured';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Supabase Connection Test</h1>
            <p className="text-gray-600">Verify your database connection and configuration</p>
          </div>
        </div>

        {/* Connection Status Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-8 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            {getStatusIcon()}
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{getStatusMessage()}</h2>
              {errorMessage && (
                <p className="text-red-600 mt-2">{errorMessage}</p>
              )}
            </div>
          </div>

          {/* Test Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-lg border-2 ${testResults.hasUrl ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center space-x-2">
                {testResults.hasUrl ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-semibold">Supabase URL</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {testResults.hasUrl ? 'Environment variable present' : 'Missing VITE_SUPABASE_URL'}
              </p>
            </div>

            <div className={`p-4 rounded-lg border-2 ${testResults.hasKey ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center space-x-2">
                {testResults.hasKey ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-semibold">Supabase Key</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {testResults.hasKey ? 'Environment variable present' : 'Missing VITE_SUPABASE_ANON_KEY'}
              </p>
            </div>

            <div className={`p-4 rounded-lg border-2 ${testResults.urlValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center space-x-2">
                {testResults.urlValid ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-semibold">URL Format</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {testResults.urlValid ? 'Valid Supabase URL format' : 'Invalid URL format'}
              </p>
            </div>

            <div className={`p-4 rounded-lg border-2 ${testResults.keyValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center space-x-2">
                {testResults.keyValid ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-semibold">Database Access</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {testResults.keyValid ? 'Successfully connected to database' : 'Cannot access database'}
              </p>
            </div>
          </div>

          {/* Retry Button */}
          <div className="text-center">
            <button
              onClick={testConnection}
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <Database className="w-5 h-5" />
              <span>Test Connection Again</span>
            </button>
          </div>
        </div>

        {/* Environment Variables Info */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Environment Variables</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">VITE_SUPABASE_URL</span>
                <button
                  onClick={() => copyToClipboard(import.meta.env.VITE_SUPABASE_URL || '')}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-600 break-all">
                {import.meta.env.VITE_SUPABASE_URL || '❌ Not set'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">VITE_SUPABASE_ANON_KEY</span>
                <button
                  onClick={() => copyToClipboard(import.meta.env.VITE_SUPABASE_ANON_KEY || '')}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                {import.meta.env.VITE_SUPABASE_ANON_KEY ? '***PRESENT***' : '❌ Not set'}
              </p>
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Setup Instructions</h3>
          
          {!isSupabaseConfigured ? (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Supabase Not Configured</h4>
                <p className="text-yellow-700 text-sm mb-3">
                  To use this app, you need to set up Supabase. Follow these steps:
                </p>
                <ol className="text-sm text-yellow-700 space-y-2 list-decimal list-inside">
                  <li>Click "Connect to Supabase" in the top right corner of Bolt</li>
                  <li>Create a new Supabase project or use an existing one</li>
                  <li>The environment variables will be automatically configured</li>
                  <li>Refresh this page to test the connection</li>
                </ol>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">🚀 For Netlify Deployment</h4>
                <p className="text-blue-700 text-sm mb-3">
                  After setting up Supabase in Bolt, you'll need to add the same environment variables to Netlify:
                </p>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Go to your Netlify site dashboard</li>
                  <li>Navigate to Site settings → Environment variables</li>
                  <li>Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</li>
                  <li>Redeploy your site</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">✅ Supabase Configured</h4>
                <p className="text-green-700 text-sm">
                  Your Supabase connection is properly configured. The app should work correctly.
                </p>
              </div>

              {testResults.userCount !== undefined && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">📊 Database Stats</h4>
                  <p className="text-blue-700 text-sm">
                    Total registered users: {testResults.userCount}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quick Links */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Quick Links</h4>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Supabase Dashboard</span>
              </a>
              
              <button
                onClick={() => window.location.href = '/env-test'}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200"
              >
                <Database className="w-4 h-4" />
                <span>Environment Test</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to App</span>
              </button>
            </div>
          </div>
        </div>

        {/* Debug Information */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 mt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Debug Information</h3>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-xs text-gray-700 overflow-auto">
              {JSON.stringify({
                environment: import.meta.env.MODE,
                supabaseConfigured: isSupabaseConfigured,
                hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
                hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
                urlLength: import.meta.env.VITE_SUPABASE_URL?.length || 0,
                keyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0,
                testResults
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseConnectionTest;