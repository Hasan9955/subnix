"use client";

import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "../store/store";
import { ToastContainer } from "react-toastify";

interface ReduxProviderProps {
  children: React.ReactNode;
}

const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Provider store={store}>
      {isMounted ? (
        <PersistGate loading={null} persistor={persistor}>
          {children}
          <ToastContainer position="top-right" autoClose={3000} />
        </PersistGate>
      ) : (
        <>{children}</>
      )}
    </Provider>
  );
};

export default ReduxProvider;
