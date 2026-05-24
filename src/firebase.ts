import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Your custom Web App's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBX3rHekscyWpkYZur2mhrEmYwhzXIoVJU",
  authDomain: "calhanorte-93d5d.firebaseapp.com",
  projectId: "calhanorte-93d5d",
  databaseURL: "https://calhanorte-93d5d-default-rtdb.firebaseio.com",
  storageBucket: "calhanorte-93d5d.firebasestorage.app",
  messagingSenderId: "265688792484",
  appId: "1:265688792484:web:f46d468294e1653782d531",
  measurementId: "G-CNKFSMSE00"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let databaseInstance;
try {
  databaseInstance = getDatabase(app);
} catch (e) {
  console.error("Realtime Database initialization failed:", e);
  // Fail-safe mock/null so the application bundle doesn't crash on import
  databaseInstance = null as any;
}

export const db = databaseInstance;
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Database Error: ', JSON.stringify(errInfo));
}
