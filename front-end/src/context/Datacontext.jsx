import React, { createContext, useState} from "react";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [globalSearchTerm, setGlobalSearchTerm] = useState('');

    return(
        <DataContext.Provider value={{ globalSearchTerm, setGlobalSearchTerm}}>
            {children}
        </DataContext.Provider>
    );
};