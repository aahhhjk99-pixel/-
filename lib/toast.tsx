import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react-native';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  show: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ show: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  const show = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, [fadeAnim]);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle color="#16a34a" size={22} />;
      case 'error': return <XCircle color="#ef4444" size={22} />;
      case 'warning': return <AlertCircle color="#f59e0b" size={22} />;
      case 'info': return <Info color="#3b82f6" size={22} />;
    }
  };

  const getBg = (type: ToastType) => {
    switch (type) {
      case 'success': return '#f0fdf4';
      case 'error': return '#fef2f2';
      case 'warning': return '#fffbeb';
      case 'info': return '#eff6ff';
    }
  };

  const getBorder = (type: ToastType) => {
    switch (type) {
      case 'success': return '#bbf7d0';
      case 'error': return '#fecaca';
      case 'warning': return '#fde68a';
      case 'info': return '#bfdbfe';
    }
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <View style={styles.container} pointerEvents="none">
        {toasts.map((toast) => (
          <Animated.View
            key={toast.id}
            style={[
              styles.toast,
              { backgroundColor: getBg(toast.type), borderColor: getBorder(toast.type), opacity: fadeAnim },
            ]}
          >
            {getIcon(toast.type)}
            <Text style={styles.text}>{toast.message}</Text>
          </Animated.View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: '90%',
  },
  text: {
    fontFamily: 'Cairo-Medium',
    fontSize: 14,
    color: '#1f2937',
    flexShrink: 1,
  },
});
