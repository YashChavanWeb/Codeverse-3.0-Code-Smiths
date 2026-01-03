import axios from "axios";
import fs from "fs-extra";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cloudinary from "../config/cloudinary.js";
import { Product } from "../products/productModel.js";

dotenv.config();

const TEMP_DIR = path.join(process.cwd(), "temp/images");

/* -------------------- PRODUCT DATA -------------------- */

const vegetables = [
  { name: "Tomato", unit: "kg", search: "tomato vegetable india market" },
  { name: "Potato", unit: "kg", search: "potato vegetable india" },
  { name: "Onion", unit: "kg", search: "onion vegetable india market" },
  { name: "Cauliflower", unit: "piece", search: "cauliflower vegetable india" },
  { name: "Cabbage", unit: "piece", search: "cabbage vegetable india" },
  { name: "Brinjal", unit: "kg", search: "brinjal vegetable india" },
  { name: "Okra", unit: "kg", search: "okra vegetable india" },
  { name: "Carrot", unit: "kg", search: "carrot vegetable india" },
  { name: "Capsicum", unit: "kg", search: "capsicum vegetable india" },
  { name: "Spinach", unit: "bunch", search: "spinach vegetable india" },
];

const fruits = [
  { name: "Banana", unit: "dozen", search: "banana fruit india" },
  { name: "Apple", unit: "kg", search: "apple fruit india market" },
  { name: "Mango", unit: "kg", search: "mango fruit india" },
  { name: "Orange", unit: "kg", search: "orange fruit india" },
  { name: "Papaya", unit: "piece", search: "papaya fruit india" },
  { name: "Pomegranate", unit: "kg", search: "pomegranate fruit india" },
  { name: "Grapes", unit: "kg", search: "grapes fruit india" },
  { name: "Guava", unit: "kg", search: "guava fruit india" },
  { name: "Pineapple", unit: "piece", search: "pineapple fruit india" },
  { name: "Watermelon", unit: "piece", search: "watermelon fruit india" },
];

/* -------------------- HELPERS -------------------- */

const getUnsplashImage = async (query) => {
  const res = await axios.get("https://api.unsplash.com/search/photos", {
    params: { query, per_page: 1 },
    headers: {
      Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
    },
  });

  return res.data.results[0].urls.regular;
};

const downloadImage = async (url, filePath) => {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  await fs.outputFile(filePath, res.data);
};

// random price between min & max
const randomPrice = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// random stock
const randomStock = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/* -------------------- SEED FUNCTION -------------------- */

const uploadProducts = async (items, category) => {
  for (const item of items) {
    try {
      const filename = `${item.name.toLowerCase().replace(/ /g, "_")}.jpg`;
      const localPath = path.join(TEMP_DIR, filename);

      console.log(`Fetching image for ${item.name}`);
      const imageUrl = await getUnsplashImage(item.search);

      await downloadImage(imageUrl, localPath);

      const upload = await cloudinary.uploader.upload(localPath, {
        folder: `smartvegis/${category.toLowerCase()}`,
      });

      await Product.create({
        name: item.name,
        category,
        imageUrl: upload.secure_url,

        price: randomPrice(20, 200), // ✅ random price
        unit: item.unit,

        stock: {
          current: randomStock(10, 100), // ✅ random stock
          before: 0, // ✅ always 0
        },

        available: true,
        vendor: process.env.DEFAULT_VENDOR_ID,
      });

      console.log(`✅ ${item.name} added`);
    } catch (err) {
      console.error(`❌ ${item.name} failed`, err.message);
    }
  }
};

/* -------------------- RUN -------------------- */

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await fs.ensureDir(TEMP_DIR);

  await uploadProducts(vegetables, "Vegetable");
  await uploadProducts(fruits, "Fruit");

  console.log("🎉 All products seeded successfully");
  process.exit(0);
};

run();
