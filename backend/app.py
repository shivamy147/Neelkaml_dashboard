from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from routes import (
    formdata_router, set_formdata_controller,
    storeinfo_router, set_storeinfo_controller,
    statistics_router, set_statistics_controller,
    auth_router, set_auth_controller
)
from controllers import FormDataController, AuthController
from controllers.storeinfo_controller import StoreInfoController
from controllers.statistics_controller import StatisticsController
from config import get_database, close_database

# Create FastAPI app
app = FastAPI(title="Nilkamal Store Dashboard API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative dev server
        "https://neelkaml-dashboard1.vercel.app",  # Production deployment
        "https://nilkamal-dashboard.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get database instance
db = get_database()

# Initialize controllers
form_data_controller = FormDataController(db)
store_info_controller = StoreInfoController(db)
statistics_controller = StatisticsController(db)
auth_controller = AuthController(db)

# Set controllers for routes
set_formdata_controller(form_data_controller)
set_storeinfo_controller(store_info_controller)
set_statistics_controller(statistics_controller)
set_auth_controller(auth_controller)

# Include routers
app.include_router(formdata_router)
app.include_router(storeinfo_router)
app.include_router(statistics_router)
app.include_router(auth_router)

# Health check
@app.get("/health")
async def health_check():
    return {
        "success": True,
        "message": "Server is running",
        "timestamp": datetime.utcnow().isoformat()
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "success": True,
        "message": "Nilkamal Store Dashboard API",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    import os
    
    port = int(os.environ.get('PORT', 8000))
    try:
        uvicorn.run(app, host="0.0.0.0", port=port)
    finally:
        close_database()
