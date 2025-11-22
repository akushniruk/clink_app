import { useState, useEffect, useCallback } from 'preact/hooks';

export interface SessionStorageConfig<T> {
    key: string;
    defaultValue: T;
    serializer?: {
        serialize: (value: T) => string;
        deserialize: (value: string) => T;
    };
}

export interface SessionStorageActions<T> {
    setValue: (value: T | ((prevValue: T) => T)) => void;
    removeValue: () => void;
    clearAll: () => void;
}

export const useSessionStorage = <T>(config: SessionStorageConfig<T>): [T, SessionStorageActions<T>] => {
    const { key, defaultValue, serializer } = config;

    // Default serializer for JSON
    const defaultSerializer = {
        serialize: (value: T) => JSON.stringify(value),
        deserialize: (value: string) => JSON.parse(value) as T,
    };

    const actualSerializer = serializer || defaultSerializer;

    // Initialize state from sessionStorage
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = sessionStorage.getItem(key);
            if (item === null) return defaultValue;
            return actualSerializer.deserialize(item);
        } catch (error) {
            console.warn(`Error reading sessionStorage key "${key}":`, error);
            return defaultValue;
        }
    });

    // Update sessionStorage whenever state changes
    useEffect(() => {
        try {
            sessionStorage.setItem(key, actualSerializer.serialize(storedValue));
        } catch (error) {
            console.warn(`Error setting sessionStorage key "${key}":`, error);
        }
    }, [key, storedValue, actualSerializer]);

    const setValue = useCallback(
        (value: T | ((prevValue: T) => T)) => {
            try {
                const valueToStore = value instanceof Function ? value(storedValue) : value;
                setStoredValue(valueToStore);
            } catch (error) {
                console.warn(`Error setting value for sessionStorage key "${key}":`, error);
            }
        },
        [key, storedValue],
    );

    const removeValue = useCallback(() => {
        try {
            sessionStorage.removeItem(key);
            setStoredValue(defaultValue);
        } catch (error) {
            console.warn(`Error removing sessionStorage key "${key}":`, error);
        }
    }, [key, defaultValue]);

    const clearAll = useCallback(() => {
        try {
            sessionStorage.clear();
            setStoredValue(defaultValue);
        } catch (error) {
            console.warn('Error clearing sessionStorage:', error);
        }
    }, [defaultValue]);

    return [
        storedValue,
        {
            setValue,
            removeValue,
            clearAll,
        },
    ];
};

// Specialized hook for managing multiple related session storage keys
export const useMultiSessionStorage = <T extends Record<string, any>>(
    keyPrefix: string,
    defaultValues: T,
): [T, (key: keyof T, value: T[keyof T]) => void, () => void] => {
    const [values, setValues] = useState<T>(defaultValues);

    // Initialize from sessionStorage
    useEffect(() => {
        const initialValues = { ...defaultValues };
        let hasChanges = false;

        for (const key in defaultValues) {
            try {
                const storageKey = `${keyPrefix}_${key}`;
                const stored = sessionStorage.getItem(storageKey);
                if (stored !== null) {
                    initialValues[key] = JSON.parse(stored);
                    hasChanges = true;
                }
            } catch (error) {
                console.warn(`Error reading sessionStorage key "${keyPrefix}_${key}":`, error);
            }
        }

        if (hasChanges) {
            setValues(initialValues);
        }
    }, [keyPrefix, defaultValues]);

    const setValue = useCallback(
        (key: keyof T, value: T[keyof T]) => {
            try {
                const storageKey = `${keyPrefix}_${String(key)}`;
                sessionStorage.setItem(storageKey, JSON.stringify(value));
                setValues((prev) => ({ ...prev, [key]: value }));
            } catch (error) {
                console.warn(`Error setting sessionStorage key "${keyPrefix}_${String(key)}":`, error);
            }
        },
        [keyPrefix],
    );

    const clearAll = useCallback(() => {
        try {
            for (const key in values) {
                const storageKey = `${keyPrefix}_${key}`;
                sessionStorage.removeItem(storageKey);
            }
            setValues(defaultValues);
        } catch (error) {
            console.warn('Error clearing sessionStorage:', error);
        }
    }, [keyPrefix, values, defaultValues]);

    return [values, setValue, clearAll];
};
