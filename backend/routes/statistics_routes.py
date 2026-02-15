from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from controllers.statistics_controller import StatisticsController

router = APIRouter()
controller: StatisticsController = None


def set_controller(statistics_controller: StatisticsController):
    global controller
    controller = statistics_controller


@router.get("/api/statistics/dashboard")
async def get_dashboard_statistics(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_name: Optional[str] = Query(None)
):
    """Get comprehensive dashboard statistics"""
    try:
        stats = await controller.get_dashboard_stats(start_date, end_date, store_name)
        return {
            "success": True,
            "data": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/statistics/stores-overview")
async def get_stores_overview_stats(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Get overview of all stores with performance metrics"""
    try:
        overview = await controller.get_stores_overview(start_date, end_date)
        return {
            "success": True,
            "data": overview
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
