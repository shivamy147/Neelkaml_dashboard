from fastapi import HTTPException, status
from models import FormData
from typing import List
from datetime import datetime


class FormDataController:
    def __init__(self, db):
        self.db = db
        self.collection = db.formdata
    
    async def get_all(self) -> List[FormData]:
        """Get all form data"""
        try:
            form_data_list = []
            cursor = self.collection.find().sort("date_of_visit", -1)
            async for document in cursor:
                # Remove MongoDB's _id field
                document.pop("_id", None)
                form_data_list.append(FormData(**document))
            return form_data_list
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching form data: {str(e)}"
            )
    
    async def get_by_id(self, form_id: str) -> FormData:
        """Get single form data by ID"""
        try:
            document = await self.collection.find_one({"id": form_id})
            
            if not document:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Form data not found"
                )
            
            # Remove MongoDB's _id field
            document.pop("_id", None)
            return FormData(**document)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching form data: {str(e)}"
            )
    
    async def create(self, form_data: FormData) -> FormData:
        """Create new form data"""
        try:
            form_dict = form_data.model_dump()
            form_dict["created_at"] = datetime.utcnow().isoformat()
            form_dict["updated_at"] = datetime.utcnow().isoformat()
            
            result = await self.collection.insert_one(form_dict)
            
            if result.inserted_id:
                created_form = await self.collection.find_one({"id": form_data.id})
                if created_form:
                    # Remove MongoDB's _id field
                    created_form.pop("_id", None)
                    return FormData(**created_form)
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create form data"
            )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error creating form data: {str(e)}"
            )
    
    async def update(self, form_id: str, form_data: FormData) -> FormData:
        """Update form data"""
        try:
            existing = await self.collection.find_one({"id": form_id})
            
            if not existing:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Form data not found"
                )
            
            form_dict = form_data.model_dump(exclude={"id", "created_at"})
            form_dict["updated_at"] = datetime.utcnow().isoformat()
            
            await self.collection.update_one(
                {"id": form_id},
                {"$set": form_dict}
            )
            
            updated_form = await self.collection.find_one({"id": form_id})
            # Remove MongoDB's _id field
            updated_form.pop("_id", None)
            return FormData(**updated_form)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error updating form data: {str(e)}"
            )
    
    async def delete(self, form_id: str) -> bool:
        """Delete form data"""
        try:
            result = await self.collection.delete_one({"id": form_id})
            
            if result.deleted_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Form data not found"
                )
            
            return True
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error deleting form data: {str(e)}"
            )
