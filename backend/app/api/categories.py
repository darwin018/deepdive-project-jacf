from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response
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
    categories = db.query(
        models.Category.id,
        models.Category.name,
        models.Category.image_url
    ).offset(skip).limit(limit).all()
    
    # Map back to objects matching the schema to support response_model
    return [{"id": c.id, "name": c.name, "image_url": c.image_url} for c in categories]

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

    
    image_data = None
    image_mime_type = None
    if image:
        image_data = image.file.read()
        image_mime_type = image.content_type
    
    db_category = models.Category(name=name, image_data=image_data, image_mime_type=image_mime_type)

    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    
    if image:
        db_category.image_url = f"/categories/{db_category.id}/image"
        db.commit()
        db.refresh(db_category)
    return {"id": db_category.id, "name": db_category.name, "image_url": db_category.image_url}

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
        db_category.image_data = image.file.read()
        db_category.image_mime_type = image.content_type
        db_category.image_url = f"/categories/{db_category.id}/image"

    db.commit()
    # Re-fetch the category to ensure it's persistent and up-to-date
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    return {"id": db_category.id, "name": db_category.name, "image_url": db_category.image_url}

@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(database.get_db)):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(db_category)
    db.commit()
    return {"message": "Category deleted successfully"}

@router.get("/{category_id}/image")
def get_category_image(category_id: int, db: Session = Depends(database.get_db)):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category or not db_category.image_data:
        raise HTTPException(status_code=404, detail="Image not found")
    
    return Response(content=db_category.image_data, media_type=db_category.image_mime_type or "image/jpeg")
