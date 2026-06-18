"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { clearTokens, fetchCurrentUser, getRefreshToken } from "@/utils/auth";

const UserContext = createContext(null);

export function UserContextProvider({ children }) {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = useCallback(async () => {
        setLoading(true);
        const data = await fetchCurrentUser();
        setUser(data);
        setLoading(false);
    }, []);

    const clearUser = useCallback(() => {
        clearTokens();
        setUser(null);
    }, []);

    useEffect(() => {
        // Only attempt to load if there is a stored refresh token (i.e. a session exists).
        if (getRefreshToken()) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, [loadUser]);

    return (
        <UserContext.Provider value={{ user, loading, loadUser, clearUser, setUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used inside UserContextProvider");
    return ctx;
}
