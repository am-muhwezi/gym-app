import React, { createContext, useReducer, useContext, useEffect, ReactNode } from 'react';
import { Client } from '../types';
import { clientService } from '../services';

type Action =
  | { type: 'LOAD_CLIENTS'; payload: Client[] }
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'UPDATE_CLIENT'; payload: Client }
  | { type: 'DELETE_CLIENT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }; // payload is clientId

interface ClientContextType {
  clients: Client[];
  loading: boolean;
  dispatch: React.Dispatch<Action>;
  getClientById: (id: string) => Client | undefined;
  refreshClients: () => Promise<void>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

interface ClientState {
  clients: Client[];
  loading: boolean;
}

const clientReducer = (state: ClientState, action: Action): ClientState => {
  switch (action.type) {
    case 'LOAD_CLIENTS':
      return { ...state, clients: action.payload, loading: false };
    case 'ADD_CLIENT':
      return { ...state, clients: [...state.clients, action.payload] };
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.payload.id ? action.payload : client
        ),
      };
    case 'DELETE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter(client => client.id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export const ClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(clientReducer, { clients: [], loading: true });

  // Load clients from backend on mount
  const refreshClients = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const data = await clientService.getAllClients();
      dispatch({ type: 'LOAD_CLIENTS', payload: data });
    } catch (error) {
      console.error('Failed to load clients from backend:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  useEffect(() => {
    refreshClients();
  }, []);

  const getClientById = (id: string) => state.clients.find(c => c.id === id);

  return (
    <ClientContext.Provider value={{
      clients: state.clients,
      loading: state.loading,
      dispatch,
      getClientById,
      refreshClients
    }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClients = (): ClientContextType => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
};
