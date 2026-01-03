import React, { createContext, useContext, useState, useEffect } from "react";

const BasketContext = createContext();

export const BasketProvider = ({ children }) => {
    const [basket, setBasket] = useState(() => {
        const saved = localStorage.getItem("basket");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("basket", JSON.stringify(basket));
    }, [basket]);

    const addToBasket = (product, vendor) => {
        setBasket((prev) => {
            // Check if product from this vendor is already in basket
            const existingIndex = prev.findIndex(
                (item) => item._id === product._id && item.vendorId === vendor._id
            );

            if (existingIndex > -1) {
                const newBasket = [...prev];
                newBasket[existingIndex] = {
                    ...newBasket[existingIndex],
                    qty: newBasket[existingIndex].qty + 1,
                };
                return newBasket;
            }

            return [
                ...prev,
                {
                    ...product,
                    vendorId: vendor._id,
                    vendorName: vendor.name,
                    qty: 1,
                },
            ];
        });
    };

    const removeFromBasket = (productId, vendorId) => {
        setBasket((prev) =>
            prev.filter((item) => !(item._id === productId && item.vendorId === vendorId))
        );
    };

    const clearBasket = () => setBasket([]);

    const basketTotal = basket.reduce(
        (total, item) => total + item.price * item.qty,
        0
    );

    const itemCount = basket.reduce((count, item) => count + item.qty, 0);

    return (
        <BasketContext.Provider
            value={{
                basket,
                addToBasket,
                removeFromBasket,
                clearBasket,
                basketTotal,
                itemCount,
            }}
        >
            {children}
        </BasketContext.Provider>
    );
};

export const useBasket = () => {
    const context = useContext(BasketContext);
    if (!context) {
        throw new Error("useBasket must be used within a BasketProvider");
    }
    return context;
};
