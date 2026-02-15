from fastapi import APIRouter, status
from models import FormData, FormDataResponse
from controllers import FormDataController

router = APIRouter(prefix="/api/formdata", tags=["FormData"])

# Controller instance (will be set from main server)
controller = None


def set_controller(form_data_controller: FormDataController):
    global controller
    controller = form_data_controller


@router.get("/", response_model=FormDataResponse)
async def get_all_form_data():
    """Get all form data"""
    form_data_list = await controller.get_all()
    return FormDataResponse(
        success=True,
        count=len(form_data_list),
        data=form_data_list
    )


@router.get("/{form_id}", response_model=FormDataResponse)
async def get_form_data_by_id(form_id: str):
    """Get single form data by ID"""
    form_data = await controller.get_by_id(form_id)
    return FormDataResponse(
        success=True,
        data=form_data
    )


@router.post("/", response_model=FormDataResponse, status_code=status.HTTP_201_CREATED)
async def create_form_data(form_data: FormData):
    """Create new form data"""
    created_data = await controller.create(form_data)
    return FormDataResponse(
        success=True,
        message="Form data created successfully",
        data=created_data
    )


@router.put("/{form_id}", response_model=FormDataResponse)
async def update_form_data(form_id: str, form_data: FormData):
    """Update form data"""
    updated_data = await controller.update(form_id, form_data)
    return FormDataResponse(
        success=True,
        message="Form data updated successfully",
        data=updated_data
    )


@router.delete("/{form_id}", response_model=FormDataResponse)
async def delete_form_data(form_id: str):
    """Delete form data"""
    await controller.delete(form_id)
    return FormDataResponse(
        success=True,
        message="Form data deleted successfully"
    )
