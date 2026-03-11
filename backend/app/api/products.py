from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Response
from sqlalchemy.orm import Session
from .. import models, schemas, database
from typing import List, Optional
import shutil
import os
import uuid

router = APIRouter(
    prefix="/products",
    tags=["products"]
)

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/", response_model=List[schemas.Product])
def read_products(
    skip: int = 0, 
    limit: int = 100, 
    category_id: Optional[int] = Query(None),
    db: Session = Depends(database.get_db)
):
    # Exclude large binary data from the read query
    base_query = db.query(
        models.Product.id,
        models.Product.name,
        models.Product.description,
        models.Product.quantity,
        models.Product.actual_price,
        models.Product.offer_price,
        models.Product.category_id,
        models.Product.image_url
    )
    
    if category_id:
        base_query = base_query.filter(models.Product.category_id == category_id)
        
    products = base_query.offset(skip).limit(limit).all()
    return [{"id": p.id, "name": p.name, "description": p.description, "quantity": p.quantity, "actual_price": p.actual_price, "offer_price": p.offer_price, "category_id": p.category_id, "image_url": p.image_url} for p in products]

@router.post("/", response_model=schemas.Product)
def create_product(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    quantity: int = Form(...),
    actual_price: float = Form(...),
    offer_price: float = Form(...),
    category_id: int = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(database.get_db)
):
    # Verify category exists
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid Category ID")

    image_data = None
    image_mime_type = None
    
    if image:
        image_data = image.file.read()
        image_mime_type = image.content_type

    db_product = models.Product(
        name=name,
        description=description,
        quantity=quantity,
        actual_price=actual_price,
        offer_price=offer_price,
        category_id=category_id,
        image_data=image_data,
        image_mime_type=image_mime_type
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    if image:
        db_product.image_url = f"/products/{db_product.id}/image"
        db.commit()
        db.refresh(db_product)

    return {
        "id": db_product.id,
        "name": db_product.name,
        "description": db_product.description,
        "quantity": db_product.quantity,
        "actual_price": db_product.actual_price,
        "offer_price": db_product.offer_price,
        "category_id": db_product.category_id,
        "image_url": db_product.image_url
    }

@router.put("/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: int,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    quantity: Optional[int] = Form(None),
    actual_price: Optional[float] = Form(None),
    offer_price: Optional[float] = Form(None),
    category_id: Optional[int] = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(database.get_db)
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    if name is not None: db_product.name = name
    if description is not None: db_product.description = description
    if quantity is not None: db_product.quantity = quantity
    if actual_price is not None: db_product.actual_price = actual_price
    if offer_price is not None: db_product.offer_price = offer_price
    
    if category_id is not None:
         # Verify category exists
        category = db.query(models.Category).filter(models.Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=400, detail="Invalid Category ID")
        db_product.category_id = category_id

    if image:
        db_product.image_data = image.file.read()
        db_product.image_mime_type = image.content_type
        db_product.image_url = f"/products/{db_product.id}/image"

    db.commit()
    # Re-fetch
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    return {
        "id": db_product.id,
        "name": db_product.name,
        "description": db_product.description,
        "quantity": db_product.quantity,
        "actual_price": db_product.actual_price,
        "offer_price": db_product.offer_price,
        "category_id": db_product.category_id,
        "image_url": db_product.image_url
    }

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(database.get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted successfully"}

@router.get("/{product_id}/image")
def get_product_image(product_id: int, db: Session = Depends(database.get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product or not db_product.image_data:
        raise HTTPException(status_code=404, detail="Image not found")
    
    return Response(content=db_product.image_data, media_type=db_product.image_mime_type or "image/jpeg")
