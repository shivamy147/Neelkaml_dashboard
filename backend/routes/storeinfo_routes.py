from fastapi import APIRouter, HTTPException
from models.storeinfo import StoreInfo, StoreInfoResponse
from controllers.storeinfo_controller import StoreInfoController

router = APIRouter()
controller: StoreInfoController = None


def set_controller(storeinfo_controller: StoreInfoController):
    global controller
    controller = storeinfo_controller


@router.get("/api/storeinfo", response_model=StoreInfoResponse)
async def get_all_stores():
    """Get all store info records"""
    try:
        stores = await controller.get_all()
        return StoreInfoResponse(
            success=True,
            data=stores,
            count=len(stores)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/storeinfo/{store_id}", response_model=StoreInfoResponse)
async def get_store_by_id(store_id: str):
    """Get store info by ID"""
    try:
        store = await controller.get_by_id(store_id)
        if not store:
            raise HTTPException(status_code=404, detail="Store not found")
        return StoreInfoResponse(success=True, data=store)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/storeinfo/name/{name}", response_model=StoreInfoResponse)
async def get_store_by_name(name: str):
    """Get store info by name"""
    try:
        store = await controller.get_by_name(name)
        if not store:
            raise HTTPException(status_code=404, detail="Store not found")
        return StoreInfoResponse(success=True, data=store)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/storeinfo", response_model=StoreInfoResponse)
async def create_store(store: StoreInfo):
    """Create new store info"""
    try:
        created_store = await controller.create(store)
        return StoreInfoResponse(
            success=True,
            message="Store info created successfully",
            data=created_store
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/api/storeinfo/{store_id}", response_model=StoreInfoResponse)
async def update_store(store_id: str, store: StoreInfo):
    """Update store info by ID"""
    try:
        updated_store = await controller.update(store_id, store)
        if not updated_store:
            raise HTTPException(status_code=404, detail="Store not found")
        return StoreInfoResponse(
            success=True,
            message="Store info updated successfully",
            data=updated_store
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/api/storeinfo/{store_id}", response_model=StoreInfoResponse)
async def delete_store(store_id: str):
    """Delete store info by ID"""
    try:
        deleted = await controller.delete(store_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Store not found")
        return StoreInfoResponse(
            success=True,
            message="Store info deleted successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
