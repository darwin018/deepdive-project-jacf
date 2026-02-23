from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from .. import models, schemas, database
from typing import List
import shutil
import os
import uuid

router = APIRouter(
    prefix="/categories",
    tags=["categories"]
)

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/", response_model=List[schemas.Category])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    categories = db.query(models.Category).offset(skip).limit(limit).all()
    return categories

@router.post("/", response_model=schemas.Category)
def create_category(
    name: str = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(database.get_db)
):
    # Check if category exists
    db_category = db.query(models.Category).filter(models.Category.name == name).first()
    if db_category:
        raise HTTPException(status_code=400, detail="Category already registered")

    
    image_url = None
    if image:
        # Save image
        file_extension = os.path.splitext(image.filename)[1]
        file_name = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
            
        # Store relative path for frontend to use
        image_url = f"/static/uploads/{file_name}"
    
    db_category = models.Category(name=name, image_url=image_url)

    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.put("/{category_id}", response_model=schemas.Category)
def update_category(
    category_id: int,
    name: str = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(database.get_db)
):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check for name duplication if name is changing
    if name != db_category.name:
        existing_category = db.query(models.Category).filter(models.Category.name == name).first()
        if existing_category:
            raise HTTPException(status_code=400, detail="Category name already exists")
    
    db_category.name = name
    
    if image:
        # Save new image
        file_extension = os.path.splitext(image.filename)[1]
        file_name = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
            
        # Delete old image if exists and not default (optional, implementation depends on requirements)
        # db_category.image_url = new_url
        db_category.image_url = f"/static/uploads/{file_name}"

    db.commit()
    # Re-fetch the category to ensure it's persistent and up-to-date
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    return db_category

@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(database.get_db)):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(db_category)
    db.commit()
    return {"message": "Category deleted successfully"}

