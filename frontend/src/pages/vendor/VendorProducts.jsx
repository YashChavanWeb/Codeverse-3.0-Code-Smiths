import React, { useEffect, useState, useRef } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Card, CardHeader, CardContent, Table } from "../../components/ui";

const VendorProducts = () => {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ price: "", stock: "", quantity: "" });

  const priceInputRef = useRef(null);

  // 🔹 Auto-focus on price input when edit starts
  useEffect(() => {
    if (editingId && priceInputRef.current) {
      priceInputRef.current.focus();
      priceInputRef.current.select();
    }
  }, [editingId]);

  // 🔹 Temporary data (replace with API)
  useEffect(() => {
    setProducts([
      {
        _id: "1",
        name: "Tomato",
        price: 30,
        unit: "kg",
        stock: 50,
        quantity: 10,
        available: true,
      },
      {
        _id: "2",
        name: "Apple",
        price: 120,
        unit: "kg",
        stock: 0,
        quantity: 0,
        available: false,
      },
    ]);
  }, []);

  const startEdit = (product) => {
    setEditingId(product._id);
    setEditData({
      price: product.price,
      stock: product.stock,
      quantity: product.quantity,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ price: "", stock: "", quantity: "" });
  };

  const saveEdit = (id) => {
    setProducts((prev) =>
      prev.map((p) =>
        p._id === id
          ? {
            ...p,
            price: Number(editData.price),
            stock: Number(editData.stock),
            quantity: Number(editData.quantity),
            available: Number(editData.stock) > 0,
          }
          : p
      )
    );

    // 🔌 Backend API will go here
    // PATCH /api/products/:id

    setEditingId(null);
  };

  const columns = [
    { header: "Product", accessor: "name" },

    {
      header: "Price",
      accessor: "price",
      cell: (row) =>
        editingId === row._id ? (
          <input
            ref={priceInputRef}
            type="number"
            className="border px-2 py-1 rounded w-24"
            value={editData.price}
            onChange={(e) =>
              setEditData({ ...editData, price: e.target.value })
            }
          />
        ) : (
          `₹${row.price}/${row.unit}`
        ),
    },

    {
      header: "Stock",
      accessor: "stock",
      cell: (row) =>
        editingId === row._id ? (
          <input
            type="number"
            className="border px-2 py-1 rounded w-24"
            value={editData.stock}
            onChange={(e) =>
              setEditData({ ...editData, stock: e.target.value })
            }
          />
        ) : (
          row.stock
        ),
    },

    {
      header: "Quantity",
      accessor: "quantity",
      cell: (row) =>
        editingId === row._id ? (
          <input
            type="number"
            className="border px-2 py-1 rounded w-24"
            value={editData.quantity}
            onChange={(e) =>
              setEditData({ ...editData, quantity: e.target.value })
            }
          />
        ) : (
          row.quantity
        ),
    },

    {
      header: "Status",
      accessor: "available",
      cell: (row) =>
        row.available ? (
          <span className="text-green-600 font-medium">Available</span>
        ) : (
          <span className="text-red-600 font-medium">Out of Stock</span>
        ),
    },

    {
      header: "Action",
      accessor: "action",
      cell: (row) =>
        editingId === row._id ? (
          <div className="flex gap-2">
            <button onClick={() => saveEdit(row._id)}>
              <Check className="w-5 h-5 text-green-600" />
            </button>
            <button onClick={cancelEdit}>
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
        ) : (
          <button onClick={() => startEdit(row)}>
            <Pencil className="w-5 h-5 text-blue-600" />
          </button>
        ),
    },
  ];

  return (
    <div className="min-h-screen bg-background-alt px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <h2 className="text-3xl font-semibold">Your Products</h2>
            <p className="text-sm text-foreground-muted">
              Click the edit icon to update price, stock, and quantity instantly
            </p>
          </CardHeader>

          <CardContent>
            <Table columns={columns} data={products} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorProducts;
