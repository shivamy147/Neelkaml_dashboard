from typing import List, Optional
from models.storeinfo import StoreInfo
from bson import ObjectId


class StoreInfoController:
    def __init__(self, db):
        self.collection = db.storeinfo
    
    async def get_all(self) -> List[dict]:
        """Get all store info records"""
        stores = []
        cursor = self.collection.find()
        async for document in cursor:
            document["id"] = str(document.pop("_id"))
            stores.append(document)
        return stores
    
    async def get_by_id(self, store_id: str) -> Optional[dict]:
        """Get store info by ID"""
        if not ObjectId.is_valid(store_id):
            return None
            
        document = await self.collection.find_one({"_id": ObjectId(store_id)})
        if document:
            document["id"] = str(document.pop("_id"))
        return document
    
    async def get_by_name(self, name: str) -> Optional[dict]:
        """Get store info by name"""
        document = await self.collection.find_one({"name": name})
        if document:
            document["id"] = str(document.pop("_id"))
        return document
    
    async def create(self, store_data: StoreInfo) -> dict:
        """Create new store info"""
        store_dict = store_data.model_dump()
        store_dict.pop("id", None)
        
        result = await self.collection.insert_one(store_dict)
        created_store = await self.collection.find_one({"_id": result.inserted_id})
        created_store["id"] = str(created_store.pop("_id"))
        return created_store
    
    async def update(self, store_id: str, store_data: StoreInfo) -> Optional[dict]:
        """Update store info by ID"""
        if not ObjectId.is_valid(store_id):
            return None
            
        store_dict = store_data.model_dump()
        store_dict.pop("id", None)
        store_dict.pop("created_at", None)
        
        from datetime import datetime
        store_dict["updated_at"] = datetime.utcnow().isoformat()
        
        result = await self.collection.update_one(
            {"_id": ObjectId(store_id)},
            {"$set": store_dict}
        )
        
        if result.modified_count > 0:
            updated_store = await self.collection.find_one({"_id": ObjectId(store_id)})
            updated_store["id"] = str(updated_store.pop("_id"))
            return updated_store
        return None
    
    async def delete(self, store_id: str) -> bool:
        """Delete store info by ID"""
        if not ObjectId.is_valid(store_id):
            return False
            
        result = await self.collection.delete_one({"_id": ObjectId(store_id)})
        return result.deleted_count > 0
