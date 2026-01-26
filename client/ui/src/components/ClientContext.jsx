import { createContext } from 'preact';
import { useReducer } from 'preact/hooks';

const initialState = {
    sharedData: {
        state: null,
        error: {
            message: null,
            disappear: false
        },
        qrCodeShow: false,
        connectedToTV: false,
        tvInfo: null
    },
    client: null
};

function reducer(state, action) {
    switch (action.type) {
        case 'SET_SHARED_DATA':
            return { ...state, sharedData: action.payload };
        case 'SET_CLIENT':
            if (state.client) return state;
            return { ...state, client: action.payload };
        case 'SET_STATE':
            return { ...state, sharedData: { ...state.sharedData, state: action.payload } };
        case 'SET_ERROR':
            return { ...state, sharedData: { ...state.sharedData, error: action.payload } };
        case 'SET_QR_CODE':
            return { ...state, sharedData: { ...state.sharedData, qrCodeShow: action.payload } };
        case 'SET_CONNECTED_TO_TV':
            return { ...state, sharedData: { ...state.sharedData, connectedToTV: action.payload } };
        case 'SET_TV_INFO':
            return { ...state, sharedData: { ...state.sharedData, tvInfo: action.payload } };
        default:
            return state;
    }
}

export const GlobalStateContext = createContext();

export function GlobalStateProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <GlobalStateContext.Provider value={{ state, dispatch }}>
            {children}
        </GlobalStateContext.Provider>
    );
}