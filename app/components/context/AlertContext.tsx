import React, { createContext, useContext, useState, ReactNode } from 'react';
import CustomAlert from '../common/CustomAlert';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
  color?: string;
  textColor?: string;
}

interface AlertOptions {
  title: string;
  message: string;
  buttons?: AlertButton[];
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: AlertButton[];
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const showAlert = (options: AlertOptions) => {
    setAlertConfig({
      visible: true,
      title: options.title,
      message: options.message,
      buttons: options.buttons?.length
        ? options.buttons
        : [
            {
              text: 'OK',
              style: 'default',
            },
          ],
    });
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons.map(btn => ({
          ...btn,
          onPress: () => {
            hideAlert();
            btn.onPress?.();
          },
        }))}
        onDismiss={hideAlert}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};