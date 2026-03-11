from pydantic import BaseModel
class TestSchema(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

class MockORM:
    def __init__(self):
        self.id = 1
        self.name = "Test"
        self.image_data = b"some binary data"

obj = MockORM()
try:
    res = TestSchema.model_validate(obj)
    print("Success!", res.model_dump())
except Exception as e:
    print("Crash!", e)
