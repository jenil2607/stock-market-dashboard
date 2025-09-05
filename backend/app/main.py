from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from typing import List

# Initialize the FastAPI app
app = FastAPI()

# Add CORS middleware to allow requests from the frontend
# ===================================================================
# PASTE THIS ENTIRE BLOCK
# ===================================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows any webpage to connect
    allow_credentials=True,
    allow_methods=["*"],  # Allows all actions (GET, POST)
    allow_headers=["*"],  # Allows all headers
)
# ===================================================================

# A list of at least 10 companies and their tickers
# This list can be expanded or changed as needed
# A list of 10 companies and their tickers
COMPANIES = {
    "Britannia Industries Ltd.": "BRITANNIA.NS",    
    "Microsoft Corp.": "MSFT",
    "Amazon.com Inc.": "AMZN",
    "NVIDIA Corp.": "NVDA",
    "Alphabet Inc. (Google)": "GOOGL",
    "Tesla, Inc.": "TSLA",
    "Meta Platforms, Inc.": "META",
    "Berkshire Hathaway Inc.": "BRK-B",
    "Eli Lilly and Company": "LLY",
    "JPMorgan Chase & Co.": "JPM",
}

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the Stock Market Dashboard API!"}

# Endpoint to get the list of companies
# This will be used to populate the left panel on the frontend
@app.get("/api/companies")
def get_companies():
    return [{"name": name, "ticker": ticker} for name, ticker in COMPANIES.items()]

# Endpoint to fetch and return historical stock data for a given ticker
# This will be used to display the chart on the frontend
@app.get("/api/stock-data/{ticker}")
def get_stock_data(ticker: str):
    try:
        # Use yfinance to get 1 year of historical data
        stock = yf.Ticker(ticker)
        hist = stock.history(period="1y")

        if hist.empty:
            raise HTTPException(status_code=404, detail="Stock data not found for the given ticker.")

        data = []
        for index, row in hist.iterrows():
            data.append({
                "date": index.strftime('%Y-%m-%d'),
                "open": row["Open"],
                "high": row["High"],
                "low": row["Low"],
                "close": row["Close"],
                "volume": row["Volume"]
            })
        return {"ticker": ticker, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))