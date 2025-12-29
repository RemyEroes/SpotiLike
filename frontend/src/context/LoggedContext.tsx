import React, { useState, createContext } from 'react';


type LoggedContextType = {
    isLoggedIn: boolean;
    username: string | null;
    setIsLoggedIn: (value: boolean) => void;
    setUsername: (value: string) => void;
};

export const LoggedContext = createContext<LoggedContextType>(
    {} as LoggedContextType
);

export function LoggedProvider({ children }: { children: React.ReactNode }) {

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
    const [username, setUsername] = useState<string>("Guest");


    const value = { isLoggedIn, setIsLoggedIn, username, setUsername };

    return (
        <LoggedContext.Provider value={value}>
            {children}
        </LoggedContext.Provider>
    );
}
