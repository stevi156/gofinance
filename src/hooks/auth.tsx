import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { CLIENT_ID } = process.env;
const { REDIRECT_URI } = process.env;
interface AuthProviderProps {
  children: ReactNode;
}

interface AuthorizationResponse {
  params: {
    access_token: string;
  };
  type: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface IAuthContextData {
  user: User;
  signInWithGoogle: () => void;
  signInWithApple: () => void;
  sigOut: () => void;
  userStorageLoading: boolean;
}

const AuthContext = createContext({} as IAuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>({} as User);
  const [userStorageLoading, setUserStorageLoading] = useState(true);

  const getUser = async () => {
    const userResponse = await AsyncStorage.getItem('@gofinance:user');
    if (userResponse) {
      setUser(JSON.parse(userResponse));
    }
    setUserStorageLoading(false);
  };
  useEffect(() => {
    getUser();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const RESPONSE_TYPE = 'token';
      const SCOPE = encodeURI('profile email');
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

      const { params, type } = (await AuthSession.startAsync({
        authUrl,
      })) as AuthorizationResponse;
      if (type === 'success') {
        const response = await fetch(
          `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`
        );
        const { email, id, name, picture } = (await response.json()) as User;
        const user = {
          email,
          id,
          name,
          picture,
        };
        setUser(user);
        await AsyncStorage.setItem('@gofinance:user', JSON.stringify(user));
      }
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  };

  const signInWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential) {
        const name = credential.fullName?.givenName!;
        const user = {
          email: credential.email!,
          id: String(credential.user),
          name,
          picture: `https://ui-avatars.com/api/?name=${name}&length=1`,
        } as User;

        setUser(user);

        await AsyncStorage.setItem('@gofinance:user', JSON.stringify(user));
      }
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  };

  const sigOut = async () => {
    setUser({} as User);
    await AsyncStorage.removeItem('@gofinance:user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signInWithGoogle,
        signInWithApple,
        sigOut,
        userStorageLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  return context;
}

export { AuthProvider, useAuth };
