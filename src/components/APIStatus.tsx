import { useState, useEffect } from 'react';
import { Button } from '@dhis2/ui';
import { IconWarning24, IconCheckmark24, IconSettings24 } from '@dhis2/ui-icons';
import { dataStoreAPI, DHIS2DataStoreAPI } from '@/lib/dhis2-api';

interface APIStatusProps {
  onStatusChange?: (isConnected: boolean) => void;
}

export function APIStatus({ onStatusChange }: APIStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  const checkConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to get namespaces to test connection
      const namespaces = await DHIS2DataStoreAPI.getAllNamespaces();
      setIsConnected(true);
      onStatusChange?.(true);
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Connection failed');
      onStatusChange?.(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusIcon = () => {
    if (isLoading) {
      return <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #ccc', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />;
    }
    
    if (isConnected) {
      return (
        <div style={{ color: '#4caf50' }}>
          <IconCheckmark24 />
        </div>
      );
    }
    
    return (
      <div style={{ color: '#f44336' }}>
        <IconWarning24 />
      </div>
    );
  };

  const getStatusText = () => {
    if (isLoading) return 'Checking connection...';
    if (isConnected) return 'Connected to DHIS2';
    return 'Not connected to DHIS2';
  };

  const getStatusColor = () => {
    if (isLoading) return '#666';
    if (isConnected) return '#4caf50';
    return '#f44336';
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      backgroundColor: 'white', 
      border: '1px solid #e1e5e9', 
      borderRadius: '8px', 
      padding: '12px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      zIndex: 1000,
      minWidth: '250px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        {getStatusIcon()}
        <span style={{ 
          fontSize: '14px', 
          fontWeight: '500', 
          color: getStatusColor() 
        }}>
          {getStatusText()}
        </span>
      </div>
      
      {error && (
        <div style={{ 
          fontSize: '12px', 
          color: '#f44336', 
          marginBottom: '8px',
          backgroundColor: '#ffebee',
          padding: '8px',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button
          secondary
          onClick={checkConnection}
          disabled={isLoading}
          style={{ fontSize: '12px', padding: '4px 8px' }}
        >
          Retry
        </Button>
        
        <Button
          secondary
          onClick={() => setShowConfig(!showConfig)}
          style={{ fontSize: '12px', padding: '4px 8px' }}
        >
          <div style={{ width: '14px', height: '14px' }}>
            <IconSettings24 />
          </div>
        </Button>
      </div>
      
      {showConfig && (
        <div style={{ 
          marginTop: '12px', 
          padding: '12px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <div style={{ marginBottom: '8px', fontWeight: '500' }}>Configuration Required:</div>
          <div style={{ marginBottom: '4px' }}>
            Create a <code>.env</code> file with:
          </div>
          <pre style={{ 
            fontSize: '11px', 
            backgroundColor: '#fff', 
            padding: '8px', 
            borderRadius: '4px',
            overflow: 'auto'
          }}>
{`VITE_DHIS2_URL=https://your-dhis2-instance.com
VITE_DHIS2_USERNAME=your-username
VITE_DHIS2_PASSWORD=your-password`}
          </pre>
          <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
            Replace with your actual DHIS2 instance details.
          </div>
        </div>
      )}
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
} 