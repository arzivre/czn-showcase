import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useEventListener } from './use-event-listener';

type Parse<T> = (d: string) => T;
type Serialize<T> = (d: T) => string;

export function useSessionStorage<T>(
  key: string,
  initial: T | (() => T),
  parse: Parse<T> = JSON.parse,
  serialize: Serialize<T> = JSON.stringify
): [T, Dispatch<SetStateAction<T>>] {
  // Save serialize function to ref to avoid executing useEffect when function changes.
  const savedSerialize = useRef<Serialize<T>>(serialize);
  useEffect(() => {
    savedSerialize.current = serialize;
  }, [serialize]);

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = sessionStorage.getItem(key);
      // Parse stored json or if none return initialValue
      if (item) {
        return parse(item);
      } else {
        return initial instanceof Function ? initial() : initial;
      }
    } catch (error) {
      // If error also return initialValue
      console.error(error);
      return initial instanceof Function ? initial() : initial;
    }
  });

  useEffect(() => {
    try {
      // Update value in storage if our state is different.
      const serialized = savedSerialize.current(storedValue);
      if (sessionStorage.getItem(key) !== serialized) {
        sessionStorage.setItem(key, serialized);
      }
    } catch (error) {
      console.error(error);
    }
  }, [storedValue, key]);

  // Listen to writes from other hook instantiations in current app and even those running in other browser tabs
  useEventListener('storage', (event) => {
    if (event.storageArea === sessionStorage) {
      if (
        event.key === key &&
        event.newValue &&
        event.newValue !== storedValue
      ) {
        // Update state if value in storage is different.
        setStoredValue(parse(event.newValue));
      }
    }
  });

  return [storedValue, setStoredValue];
}
