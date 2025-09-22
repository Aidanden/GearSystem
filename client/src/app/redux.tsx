import { useRef } from "react";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
  Provider,
} from "react-redux";
import globalReducer from "@/state";
import { api } from "@/state/api";
import authReducer from "@/state/authSlice";
import { setupListeners } from "@reduxjs/toolkit/query";

// Import API slices to register their endpoints
import "@/state/apiSlices/authApi";
import "@/state/apiSlices/productsApi";
import "@/state/apiSlices/categoriesApi";
import "@/state/apiSlices/suppliersApi";
import { storesApi } from "@/state/apiSlices/storesApi";
import { customersApi } from "@/state/apiSlices/customersApi";
import { salesApi } from "@/state/apiSlices/salesApi";

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

/* REDUX PERSISTENCE */
const createNoopStorage = () => {
  return {
    getItem(_key: any) {
      return Promise.resolve(null);
    },
    setItem(_key: any, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: any) {
      return Promise.resolve();
    },
  };
};

const storage =
  typeof window === "undefined"
    ? createNoopStorage()
    : createWebStorage("local");

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["global", "auth"],
  version: 1,
  migrate: (state: any) => {
    // Clean up old state keys that no longer exist
    if (state && typeof state === 'object') {
      const { nationalits, currencies, ...cleanState } = state;
      return Promise.resolve(cleanState);
    }
    return Promise.resolve(state);
  },
};
const rootReducer = combineReducers({
  global: globalReducer,
  auth: authReducer,
  [api.reducerPath]: api.reducer,
  [storesApi.reducerPath]: storesApi.reducer,
  [customersApi.reducerPath]: customersApi.reducer,
  [salesApi.reducerPath]: salesApi.reducer,
});
const persistedReducer = persistReducer(persistConfig, rootReducer);

/* REDUX STORE */
export const makeStore = () => {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(api.middleware, storesApi.middleware, customersApi.middleware, salesApi.middleware),
  });
};

/* REDUX TYPES */
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/* PROVIDER */
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    storeRef.current = makeStore();
    setupListeners(storeRef.current.dispatch);
  }
  const persistor = persistStore(storeRef.current);

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}