from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import json
import os
import asyncio

try:
    from scrapling import StealthyFetcher
    HAS_SCRAPLING = True
except Exception as e:
    print(f"Scrapling failed to load: {e}")
    HAS_SCRAPLING = False

app = FastAPI(title="ListingAI Scraper API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class Product(BaseModel):
    title: str
    price: str
    image_url: str
    link: str
    supplier_name: Optional[str] = None
    sales_volume: Optional[str] = None
    growth_percentage: Optional[str] = None

class Supplier(BaseModel):
    name: str
    rating: str
    top_selling_items: List[str]
    link: str

# Helper to configure the Scrapling Fetcher
def get_fetcher():
    if not HAS_SCRAPLING:
        raise Exception("Scrapling is not available. Please ensure Playwright and browser dependencies are installed.")
    # StealthyFetcher is designed to bypass Cloudflare, DataDome, etc.
    # It uses optimized settings to mimic a real user browser
    return StealthyFetcher(headless=True)

@app.get("/api/trends/top", response_model=List[Product])
def get_top_products():
    """
    Scrapes high sales volume products.
    """
    url = "https://www.aliexpress.com/p/calmp/index.html" # Example top ranking page
    try:
        fetcher = get_fetcher()
        page = fetcher.get(url)
        
        products = []
        # Replace these CSS selectors with the actual target site structure.
        # These are illustrative selectors for demonstration.
        items = page.css(".manhattan--container--1lP57Ag")[:10]
        
        for item in items:
            title_node = item.css_first(".cards--title--2rMzZ_w")
            price_node = item.css_first(".cards--price--3cdjZ2D")
            image_node = item.css_first(".cards--img--3i3pZ50 img")
            link_node = item.css_first("a")
            sales_node = item.css_first(".cards--trade--2UoK2xS")

            if title_node and price_node:
                products.append({
                    "title": title_node.text.strip(),
                    "price": price_node.text.strip(),
                    "image_url": image_node.attrib.get('src', '') if image_node else '',
                    "link": f"https:{link_node.attrib.get('href', '')}" if link_node else '',
                    "supplier_name": "Unknown",
                    "sales_volume": sales_node.text.strip() if sales_node else "N/A"
                })
        
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trends/growing", response_model=List[Product])
def get_trending_products():
    """
    Scrapes products with rapidly growing daily sales (Movers & Shakers).
    """
    url = "https://www.amazon.com/gp/movers-and-shakers/"
    try:
        fetcher = get_fetcher()
        page = fetcher.get(url)
        
        products = []
        # Using Scrapling CSS selectors. Update with actual classes if they change.
        items = page.css(".zg-grid-general-faceout")[:10]
        
        for item in items:
            title_node = item.css_first("._cDEzb_p13n-sc-css-line-clamp-3_g3dy1")
            price_node = item.css_first(".p13n-sc-price")
            image_node = item.css_first("img")
            link_node = item.css_first("a.a-link-normal")
            growth_node = item.css_first(".zg-badge-text")
            
            if title_node:
                products.append({
                    "title": title_node.text.strip(),
                    "price": price_node.text.strip() if price_node else "N/A",
                    "image_url": image_node.attrib.get('src', '') if image_node else '',
                    "link": f"https://www.amazon.com{link_node.attrib.get('href', '')}" if link_node else '',
                    "supplier_name": "Various",
                    "growth_percentage": growth_node.text.strip() if growth_node else "Trending"
                })
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/suppliers/top", response_model=List[Supplier])
def get_top_suppliers():
    """
    Scrapes supplier details, ratings, and top-selling items.
    """
    url = "https://www.aliexpress.com/store/top-brands.html"
    try:
        fetcher = get_fetcher()
        page = fetcher.get(url)
        
        suppliers = []
        items = page.css(".store-item")[:5]
        
        for item in items:
            name_node = item.css_first(".store-name")
            rating_node = item.css_first(".store-rating")
            link_node = item.css_first("a.store-link")
            
            if name_node:
                suppliers.append({
                    "name": name_node.text.strip(),
                    "rating": rating_node.text.strip() if rating_node else "N/A",
                    "top_selling_items": ["Product A", "Product B"], # Typically requires navigating to store page
                    "link": f"https:{link_node.attrib.get('href', '')}" if link_node else '',
                })
        return suppliers
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
