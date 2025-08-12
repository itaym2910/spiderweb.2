import random
from faker import Faker
from datetime import datetime, timedelta

fake = Faker()

def generate_dummy_data():
    """
    Generates a complete, interconnected set of dummy data for the application.
    """
    print("Generating dummy data...")

    # --- Net Types ---
    net_types = [
        {"id": 1, "name": "L-Chart Network"},
        {"id": 2, "name": "P-Chart Network"},
    ]

    # --- Core Sites (Pikudim) ---
    core_sites = []
    for i in range(1, 7):
        core_sites.append({"id": i, "name": f"Pikud {fake.city()}", "network_ids": [1]})
    for i in range(7, 12):
        core_sites.append({"id": i, "name": f"Pikud {fake.city()}", "network_ids": [2]})

    # --- Core Devices ---
    core_devices = []
    device_id_counter = 1
    for cs in core_sites:
        num_devices = random.randint(2, 6)
        for _ in range(num_devices):
            device = {
                "id": device_id_counter,
                "name": f"rtr-{fake.word()}-{random.randint(1,100)}",
                "ip": fake.ipv4(),
                "coresite_id": cs["id"],
                "network_ids": cs["network_ids"]
            }
            core_devices.append(device)
            device_id_counter += 1

    # --- End Sites ---
    sites = []
    site_id_counter = 1
    for _ in range(150):
        site_name = fake.company()
        site_desc = fake.bs()
        site = {
            "id": site_id_counter,
            "name": site_name,
            "topology": "{}",
            "description": site_desc,
            "coredevice_ids": [random.choice(core_devices)["id"] for _ in range(random.randint(1,2))]
        }
        sites.append(site)
        site_id_counter += 1
    
    # --- Links ---
    links = []
    link_id_counter = 1
    for device in core_devices:
        # Create some links to other core devices
        for _ in range(random.randint(1, 3)):
            neighbor = random.choice(core_devices)
            if neighbor["id"] == device["id"]:
                continue
            
            link = {
                "id": link_id_counter,
                "coredevice_id": device["id"],
                "neighbor_coredevice_id": neighbor["id"],
                "neighbor_ip": neighbor["ip"],
                "neighbor_is_core": True,
                "description": f"Core link between {device['name']} and {neighbor['name']}",
                "cdp": f"neighbor-switch-{fake.word()}",
                "physical_status": random.choice(["Up", "Down"]),
                "protocol_status": random.choice(["Up", "Down"]),
                "mpls_ldp": random.choice(["Enabled", "Disabled"]),
                "isis": random.choice(["Enabled", "Disabled"]),
                "espf_interface_address": fake.ipv4(),
                "bw": random.choice(["10G", "40G", "100G"]),
                "media_type": "Fiber",
                "input_rate": f"{random.randint(1,9)} Gbps",
                "output_rate": f"{random.randint(1,9)} Gbps",
                "rx": f"-{random.uniform(1, 5):.1f} dBm",
                "tx": f"-{random.uniform(1, 5):.1f} dBm",
                "input_errors": str(random.randint(0, 10)),
                "output_errors": str(random.randint(0, 5)),
                "crc": str(random.randint(0, 2)),
                "created_at": (datetime.utcnow() - timedelta(days=random.randint(0, 30))).isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                "crawler_cycle_id": 1,
            }
            links.append(link)
            link_id_counter += 1

    # --- Users ---
    users = [
        {"id": 1, "username": "admin", "role": "admin", "favorite_links": [1, 3, 5]},
        {"id": 2, "username": "userg", "role": "user", "favorite_links": [2, 4]},
    ]
    
    # --- Alerts ---
    alerts = []
    alert_id_counter = 1
    for _ in range(50):
        device = random.choice(core_devices)
        alert = {
            "id": alert_id_counter,
            "type": random.choice(["error", "warning", "info"]),
            "message": fake.sentence(nb_words=6),
            "timestamp": (datetime.utcnow() - timedelta(minutes=random.randint(1, 1440))).isoformat(),
            "network_line": f"Line-{random.randint(1,10)}",
            "source": f"System-{random.choice(['A', 'B', 'C'])}",
            "severity_score": random.randint(1, 10),
            "details": {"info": fake.sentence(), "remediation": "Check device logs."},
            "draw_number": 1,
            "coredevice_name": device["name"],
            "coredevice_id": device["id"]
        }
        alerts.append(alert)
        alert_id_counter+=1


    # --- Networks (associating sites and devices) ---
    networks = [
        {"id": 1, "name": "L-Chart Network"},
        {"id": 2, "name": "P-Chart Network"},
    ]

    print("Dummy data generation complete.")
    return {
        "net_types": net_types,
        "core_sites": core_sites,
        "core_devices": core_devices,
        "sites": sites,
        "links": links,
        "users": users,
        "alerts": alerts,
        "networks": networks,
        "crawler_cycle": {"id": 1, "count": 125}
    }

# Generate and store data in a variable
DUMMY_DB = generate_dummy_data()