from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Response
from sqlalchemy.orm import Session
from PIL import Image
import io
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
    base_query = db.query(models.Product)
    
    if category_id:
        base_query = base_query.filter(models.Product.category_id == category_id)
        
    products = base_query.offset(skip).limit(limit).all()
    return products

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
        image_bytes = image.file.read()
        try:
            img = Image.open(io.BytesIO(image_bytes))
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            img.thumbnail((1000, 1000))
            buffer = io.BytesIO()
            img.save(buffer, format="webp", quality=80)
            image_data = buffer.getvalue()
            image_mime_type = "image/webp"
        except Exception:
            image_data = image_bytes
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

    return db_product

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
        image_bytes = image.file.read()
        try:
            img = Image.open(io.BytesIO(image_bytes))
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            img.thumbnail((1000, 1000))
            buffer = io.BytesIO()
            img.save(buffer, format="webp", quality=80)
            db_product.image_data = buffer.getvalue()
            db_product.image_mime_type = "image/webp"
        except Exception:
            db_product.image_data = image_bytes
            db_product.image_mime_type = image.content_type
        db_product.image_url = f"/products/{db_product.id}/image"

    db.commit()
    # Re-fetch
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    return db_product

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
    
    return Response(
        content=db_product.image_data, 
        media_type=db_product.image_mime_type or "image/jpeg",
        headers={"Cache-Control": "public, max-age=31536000"}
    )
