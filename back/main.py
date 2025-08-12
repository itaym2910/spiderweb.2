import time
import os
import json
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from dummy_data import DUMMY_DB

# --- Pydantic Schemas for Request Bodies (matching frontend schemas) ---

class LoginRequest(BaseModel):
    username: str
    password: str

class CoreDeviceCreate(BaseModel):
    name: str
    ip: str
    coresite_id: int

class CoreSiteCreate(BaseModel):
    name: str

class NetworkCreate(BaseModel):
    name: str

class SiteDescription(BaseModel):
    description: str

class LinkBase(BaseModel):
    pass # Not used in dummy backend, but kept for signature matching

# --- FastAPI App Initialization ---
app = FastAPI(title="Spiderweb Dummy Backend")

# --- CORS Middleware ---
# Allows the frontend (e.g., from http://localhost:5173) to communicate with the backend.
origins = [
    "http://localhost",
    "http://localhost:5173",  # Default Vite dev server port
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory database from our dummy data generator
db = DUMMY_DB

# --- Dummy Authentication Dependencies ---
# These functions simulate the role checkers from the original backend.
def user_role_checker(request: Request):
    # For dummy backend, we'll just return a mock user
    user = next((u for u in db["users"] if u["username"] == "userg"), None)
    if not user:
        raise HTTPException(status_code=401, detail="Mock user not found")
    return user

def admin_role_checker(request: Request):
    # For dummy backend, we'll just return a mock admin
    admin_user = next((u for u in db["users"] if u["role"] == "admin"), None)
    if not admin_user:
        raise HTTPException(status_code=401, detail="Mock admin not found")
    return admin_user


# ==============================================================================
# ALERTS ROUTES (from alerts.py)
# ==============================================================================
router_alerts = APIRouter()

@router_alerts.get("/alerts")
def get_alerts(last_crawl_number: int = None):
    if last_crawl_number is None:
        return JSONResponse(
            content={"error": "last_crawl_number is required", "current_crawl_number": db["crawler_cycle"]["count"]},
            status_code=400
        )

    # Simulate long polling
    start_time = time.time()
    while True:
        # In a real app, this would be a more complex check. Here we just return everything.
        if db["crawler_cycle"]["count"] > last_crawl_number:
            return JSONResponse(
                content={"alerts": db["alerts"], "current_crawl_number": db["crawler_cycle"]["count"]},
                media_type="application/json"
            )
        if time.time() - start_time > 15:  # Reduced timeout for dummy
            return JSONResponse(content={"error": "timeout"}, status_code=408)
        time.sleep(2)

# ==============================================================================
# CORE DEVICE ROUTES (from coredevice.py)
# ==============================================================================
router_coredevice = APIRouter()

@router_coredevice.get("/coresite/{coresite_id}/coredevices")
async def get_core_devices(coresite_id: int, current_user: dict = Depends(user_role_checker)):
    devices = [d for d in db["core_devices"] if d["coresite_id"] == coresite_id]
    return [
        {key: value for key, value in device.items() if key != 'coresite_id'}
        for device in devices
    ]

@router_coredevice.get("/network/{network_id}/coresite/{coresite_id}/coredevices")
async def get_coresite_coredevices_with_network(network_id: int, coresite_id: int):
    devices = [
        d for d in db["core_devices"] 
        if d["coresite_id"] == coresite_id and network_id in d.get("network_ids", [])
    ]
    return [
        {key: value for key, value in device.items() if key != 'coresite_id'}
        for device in devices
    ]

@router_coredevice.post("/admin/coredevice/create/")
async def create_coredevice_admin(coredevice: CoreDeviceCreate, current_user: dict = Depends(admin_role_checker)):
    if any(d["name"] == coredevice.name for d in db["core_devices"]):
        raise HTTPException(status_code=400, detail="coredevice already exists.")
    
    new_id = max(d["id"] for d in db["core_devices"]) + 1 if db["core_devices"] else 1
    new_device = {
        "id": new_id,
        "name": coredevice.name,
        "ip": coredevice.ip,
        "coresite_id": coredevice.coresite_id,
        "network_ids": []
    }
    db["core_devices"].append(new_device)
    return new_device

@router_coredevice.delete("/admin/coredevice/delete/{coredevice_id}")
async def delete_coredevice_admin(coredevice_id: int, current_user: dict = Depends(admin_role_checker)):
    device_to_delete = next((d for d in db["core_devices"] if d["id"] == coredevice_id), None)
    if not device_to_delete:
        raise HTTPException(status_code=404, detail='coredevice not found.')
    
    # Simple check if associated, in real app this would be a DB query
    if any(coredevice_id in s.get("coredevice_ids", []) for s in db["sites"]):
         raise HTTPException(status_code=400, detail="Coredevice is associated with coresite, cannot delete")

    db["core_devices"] = [d for d in db["core_devices"] if d["id"] != coredevice_id]
    return {"message": "Coredevice deleted successfully"}


# ==============================================================================
# CORE SITE ROUTES (from coresite.py)
# ==============================================================================
router_coresite = APIRouter()

# This overrides the one in coredevice.py, but they have the same path. FastAPI uses the last one defined.
@router_coresite.get("/coresite/{coresite_id}/coredevices")
async def get_core_devices_for_site(coresite_id: int, current_user: dict = Depends(user_role_checker)):
    devices = [d for d in db["core_devices"] if d["coresite_id"] == coresite_id]
    return [{"id": dev["id"], "name": dev["name"], "ip": dev["ip"]} for dev in devices]

@router_coresite.post("/admin/coresite/create/")
async def create_coresite_admin(coresite: CoreSiteCreate, current_user: dict = Depends(admin_role_checker)):
    if any(cs["name"] == coresite.name for cs in db["core_sites"]):
        raise HTTPException(status_code=400, detail="coresite already exists.")
    
    new_id = max(cs["id"] for cs in db["core_sites"]) + 1 if db["core_sites"] else 1
    new_site = {"id": new_id, "name": coresite.name, "network_ids": []}
    db["core_sites"].append(new_site)
    return new_site

@router_coresite.delete("/admin/coresite/delete/{coresite_id}")
async def delete_coresite_admin(coresite_id: int, current_user: dict = Depends(admin_role_checker)):
    site_to_delete = next((cs for cs in db["core_sites"] if cs["id"] == coresite_id), None)
    if not site_to_delete:
        raise HTTPException(status_code=404, detail='coresite not found.')

    if any(d["coresite_id"] == coresite_id for d in db["core_devices"]):
        raise HTTPException(status_code=400, detail="Coresite is associated with coredevice, cannot delete")

    db["core_sites"] = [cs for cs in db["core_sites"] if cs["id"] != coresite_id]
    return {"message": "Coresite deleted successfully"}

# ==============================================================================
# NETWORK ROUTES (from network.py)
# ==============================================================================
router_network = APIRouter()

@router_network.get("/networks/")
async def get_networks(current_user: dict = Depends(user_role_checker)):
    return [{"id": n["id"], "name": n["name"]} for n in db["networks"]]

@router_network.get("/network/{network_id}/coresites")
async def get_network_coresites(network_id: int, current_user: dict = Depends(user_role_checker)):
    sites = [cs for cs in db["core_sites"] if network_id in cs.get("network_ids", [])]
    return [{"id": s["id"], "name": s["name"]} for s in sites]

@router_network.post("/admin/network/create/")
async def create_network_admin(network: NetworkCreate, current_user: dict = Depends(admin_role_checker)):
    if any(n["name"] == network.name for n in db["networks"]):
        raise HTTPException(status_code=400, detail="network already exists.")
    
    new_id = max(n["id"] for n in db["networks"]) + 1 if db["networks"] else 1
    new_network = {"id": new_id, "name": network.name}
    db["networks"].append(new_network)
    return new_network

@router_network.delete("/admin/network/delete/{network_id}")
async def delete_network_admin(network_id: int, current_user: dict = Depends(admin_role_checker)):
    if not any(n["id"] == network_id for n in db["networks"]):
         raise HTTPException(status_code=404, detail='network not found.')

    if any(network_id in cs.get("network_ids", []) for cs in db["core_sites"]) or \
       any(network_id in d.get("network_ids", []) for d in db["core_devices"]):
       raise HTTPException(status_code=400, detail="Network is associated with coresite or coredevice, cannot delete")

    db["networks"] = [n for n in db["networks"] if n["id"] != network_id]
    return {"message": "Network deleted successfully"}


# ==============================================================================
# LINK ROUTES (from link.py)
# ==============================================================================
router_link = APIRouter()

@router_link.get("/link/{link_id}")
async def get_link(link_id: int, current_user: dict = Depends(user_role_checker)):
    link = next((l for l in db["links"] if l["id"] == link_id), None)
    if link is None:
        raise HTTPException(status_code=404, detail="Link not found")
    return link

@router_link.get("/links")
def get_filtered_links(
        skip: int = 0, limit: int = 20, coredevice_id: Optional[int] = None,
        neighbor_site_id: Optional[str] = None, neighbor_coredevice_id: Optional[str] = None,
        start_date: Optional[str] = None, end_date: Optional[str] = None,
        current_user: dict = Depends(user_role_checker)):
    
    results = db["links"]
    if coredevice_id:
        results = [l for l in results if l["coredevice_id"] == coredevice_id]

    # Other filters can be added here if needed for dummy logic
    
    return results[skip : skip + limit]

@router_link.get("/coredevice/{coredevice_id}/links-to-end-sites")
def get_links_to_end_sites(coredevice_id: Optional[int] = None, current_user: dict = Depends(user_role_checker)):
    # This is a complex query, for the dummy backend we can return a subset of links
    # that are NOT core-to-core
    end_site_links = [l for l in db["links"] if l["coredevice_id"] == coredevice_id and not l["neighbor_is_core"]]
    return end_site_links

@router_link.get("/favorite-links")
async def get_favorite_links(current_user: dict = Depends(user_role_checker)):
    user_id = current_user['id']
    user = next((u for u in db["users"] if u["id"] == user_id), None)
    if user:
        return [l for l in db["links"] if l["id"] in user["favorite_links"]]
    return []

@router_link.post("/add-favorite-link/{link_id}")
async def add_favorite_link(link_id: int, current_user: dict = Depends(user_role_checker)):
    user_id = current_user['id']
    user = next((u for u in db["users"] if u["id"] == user_id), None)
    link = next((l for l in db["links"] if l["id"] == link_id), None)
    if user and link:
        if link_id not in user["favorite_links"]:
            user["favorite_links"].append(link_id)
        return {"message": "Link added to favorites successfully"}
    raise HTTPException(status_code=404, detail="Link or user not found")

@router_link.delete("/delete-favorite-link/{link_id}")
async def delete_favorite_link(link_id: int, current_user: dict = Depends(user_role_checker)):
    user_id = current_user['id']
    user = next((u for u in db["users"] if u["id"] == user_id), None)
    link = next((l for l in db["links"] if l["id"] == link_id), None)
    if user and link:
        if link_id in user["favorite_links"]:
            user["favorite_links"].remove(link_id)
        return {"message": "Link removed from favorites successfully"}
    raise HTTPException(status_code=404, detail="Link or user not found")

@router_link.get("/links/topology")
def get_links_with_neighbors():
    return db["links"]

# ==============================================================================
# SITE ROUTES (from site.py)
# ==============================================================================
router_site = APIRouter()

@router_site.get("/site/{site_id}")
async def get_site(site_id: int, current_user: dict = Depends(user_role_checker)):
    site = next((s for s in db["sites"] if s["id"] == site_id), None)
    if site is None:
        raise HTTPException(status_code=404, detail="Site not found")
    return site

@router_site.get("/coredevice/{coredevice_id}/sites", response_model=list)
async def get_sites_of_coredevice(coredevice_id: int, current_user: dict = Depends(user_role_checker)):
    sites = [s for s in db["sites"] if coredevice_id in s["coredevice_ids"]]
    return sites

@router_site.get("/sites", response_model=List[dict])
async def get_all_sites(current_user: dict = Depends(user_role_checker)):
    return [{"id": str(s["id"]), "name": s["name"]} for s in db["sites"]]

@router_site.post("/site/{site_id}/set-topology")
async def set_topology(site_id: int, current_user: dict = Depends(user_role_checker)):
    site = next((s for s in db["sites"] if s["id"] == site_id), None)
    if site is None:
        raise HTTPException(status_code=404, detail="Site not found")
    # Mock topology data
    mock_topo = ([{"x": 1, "y": 2}], [{"source": 0, "target": 0}])
    site["topology"] = json.dumps(mock_topo)
    return {"message": "Topology set successfully"}

@router_site.get("/site/{site_id}/get-topology")
async def get_topology(site_id: int, current_user: dict = Depends(user_role_checker)):
    site = next((s for s in db["sites"] if s["id"] == site_id), None)
    if site is None:
        raise HTTPException(status_code=404, detail="Site not found")
    if not site["topology"]:
        return {}
    return json.loads(site["topology"])

@router_site.put("/site/{site_id}/set-description")
async def update_site_description(site_id: int, description: SiteDescription, current_user: dict = Depends(user_role_checker)):
    site = next((s for s in db["sites"] if s["id"] == site_id), None)
    if site is None:
        raise HTTPException(status_code=404, detail="Site not found")
    site["description"] = description.description
    return {"message": "Description updated successfully"}

@router_site.get("/site/{site_id}/get-description")
async def get_site_description(site_id: int, current_user: dict = Depends(user_role_checker)):
    site = next((s for s in db["sites"] if s["id"] == site_id), None)
    if site is None:
        raise HTTPException(status_code=404, detail="Site not found")
    return site["description"]

# ==============================================================================
# USER ROUTES (from user.py)
# ==============================================================================
router_user = APIRouter()

# Dummy token generation for mock backend
def generate_token(user_id: int) -> str:
    from jose import jwt
    # In a real app, use a strong, environment-variable-based secret key
    SECRET_KEY = "a-dummy-secret-key-for-testing"
    ALGORITHM = "HS256"
    to_encode = {"sub": str(user_id), "exp": datetime.utcnow() + timedelta(hours=1)}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router_user.post("/login")
def login(request: LoginRequest):
    # Simplified mock authentication
    username = request.username
    # In this mock, we don't verify password to allow easy login
    user = next((u for u in db["users"] if u["username"] == username), None)
    if user:
        token = generate_token(user_id=user["id"])
        return {"access_token": token, "token_type": "bearer", "role": user["role"]}
    else:
        raise HTTPException(status_code=401, detail="Incorrect username or password")

@router_user.get("/users/")
async def get_all_users(current_user: dict = Depends(admin_role_checker)):
    return [{"id": u["id"], "username": u["username"], "role": u["role"]} for u in db["users"]]

@router_user.put("/users/{user_id}/make-admin")
async def make_user_admin(user_id: int, current_user: dict = Depends(admin_role_checker)):
    user = next((u for u in db["users"] if u["id"] == user_id), None)
    if user:
        user["role"] = "admin"
        return {"message": f"User {user['username']} is now an admin"}
    else:
        raise HTTPException(status_code=404, detail="User not found")


# --- Include all routers in the main FastAPI app ---
app.include_router(router_alerts, tags=["Alerts"])
app.include_router(router_coredevice, tags=["Core Devices"])
app.include_router(router_coresite, tags=["Core Sites"])
app.include_router(router_network, tags=["Networks"])
app.include_router(router_link, tags=["Links"])
app.include_router(router_site, tags=["Sites"])
app.include_router(router_user, tags=["Users"])


# --- Root endpoint for health check ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the Spiderweb Dummy Backend"}

# To run this app:
# 1. Save this file as main.py
# 2. Make sure you have `requirements.txt` in the same directory
# 3. Run `pip install -r requirements.txt`
# 4. Run `uvicorn main:app --reload`