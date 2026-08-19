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
    allowed_endings = [4, 5, 1, 2, 7, 8]
    for cs in core_sites:
        num_devices = random.randint(2, 6)
        for i in range(num_devices):
            ending = allowed_endings[i] if i < len(allowed_endings) else random.choice(allowed_endings)
            dev_name = f"rtr-{fake.word()}-{ending}"
            dev_ip = fake.ipv4()
            device = {
                "id": device_id_counter,
                "name": dev_name,
                "hostname": dev_name,
                "ip": dev_ip,
                "ip_address": dev_ip,
                "coresite_id": cs["id"],
                "core_pikudim_site_id": cs["id"],
                "network_ids": cs["network_ids"],
                "network_type_id": cs["network_ids"][0] if cs["network_ids"] else 1,
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

    # 1. Connect the top 2 devices of each site internally (Same Site Links)
    top_devices_by_site = {}
    for cs in core_sites:
        site_devs = [d for d in core_devices if d["coresite_id"] == cs["id"]]
        # Sort using the frontend priority order: [4, 5, 1, 2, 7, 8]
        priority_order = [4, 5, 1, 2, 7, 8]
        def get_priority(device):
            try:
                ending = int(device["name"].split("-")[-1])
                return priority_order.index(ending)
            except (ValueError, IndexError):
                return 99
        site_devs.sort(key=get_priority)
        top_devices_by_site[cs["id"]] = site_devs[:2]
        
        # Add a link between them
        if len(site_devs) >= 2:
            dev1, dev2 = site_devs[0], site_devs[1]
            links.append({
                "id": link_id_counter,
                "coredevice_id": dev1["id"],
                "neighbor_coredevice_id": dev2["id"],
                "network_type_id": dev1.get("network_type_id", 1),
                "network_ids": dev1.get("network_ids", [1]),
                "neighbor_ip": dev2["ip"],
                "neighbor_is_core": True,
                "description": f"Internal Core Link between {dev1['name']} and {dev2['name']}",
                "cdp": f"neighbor-switch-{fake.word()}",
                "physical_status": "Up",
                "protocol_status": "Up",
                "mpls_ldp": "Enabled",
                "isis": "Enabled",
                "espf_interface_address": fake.ipv4(),
                "bw": "10G",
                "bandwidth": "10G",
                "media_type": "Fiber",
                "input_rate": "1.5 Gbps",
                "output_rate": "1.2 Gbps",
                "rx": "-3.2 dBm",
                "tx": "-2.9 dBm",
                "input_errors": "0",
                "output_errors": "0",
                "crc": "0",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                "crawler_cycle_id": 1,
            })
            link_id_counter += 1

    # 2. Generate random Inter-Site links specifically between the top devices to ensure high visibility on L-Chart/P-Chart
    l_top_devices = []
    p_top_devices = []
    for cs_id, devs in top_devices_by_site.items():
        if cs_id <= 6:
            l_top_devices.extend(devs)
        else:
            p_top_devices.extend(devs)

    created_pairs = set()

    def generate_inter_site_links(dev_list, count):
        nonlocal link_id_counter
        for _ in range(count):
            if len(dev_list) < 2:
                break
            attempts = 0
            while attempts < 100:
                d1 = random.choice(dev_list)
                d2 = random.choice(dev_list)
                if d1["coresite_id"] == d2["coresite_id"]:
                    attempts += 1
                    continue
                pair = tuple(sorted([d1["id"], d2["id"]]))
                if pair in created_pairs:
                    attempts += 1
                    continue
                created_pairs.add(pair)
                
                links.append({
                    "id": link_id_counter,
                    "coredevice_id": d1["id"],
                    "neighbor_coredevice_id": d2["id"],
                    "network_type_id": d1.get("network_type_id", 1),
                    "network_ids": d1.get("network_ids", [1]),
                    "neighbor_ip": d2["ip"],
                    "neighbor_is_core": True,
                    "description": f"Inter-Site Link between {d1['name']} and {d2['name']}",
                    "cdp": f"neighbor-switch-{fake.word()}",
                    "physical_status": random.choice(["Up", "Up", "Down"]),
                    "protocol_status": random.choice(["Up", "Up", "Down"]),
                    "mpls_ldp": "Enabled",
                    "isis": "Enabled",
                    "espf_interface_address": fake.ipv4(),
                    "bw": "10G",
                    "bandwidth": "10G",
                    "media_type": "Fiber",
                    "input_rate": f"{random.randint(1,9)} Gbps",
                    "output_rate": f"{random.randint(1,9)} Gbps",
                    "rx": f"-{random.uniform(1, 5):.1f} dBm",
                    "tx": f"-{random.uniform(1, 5):.1f} dBm",
                    "input_errors": str(random.randint(0, 10)),
                    "output_errors": str(random.randint(0, 5)),
                    "crc": str(random.randint(0, 2)),
                    "created_at": (datetime.utcnow() - timedelta(days=random.uniform(1, 30))).isoformat(),
                    "updated_at": (datetime.utcnow() - timedelta(hours=random.choice([random.uniform(0.1, 23), random.uniform(25, 160), random.uniform(170, 700)]))).isoformat(),
                    "status_changed_at": (datetime.utcnow() - timedelta(hours=random.choice([random.uniform(0.1, 23), random.uniform(25, 160), random.uniform(170, 700)]))).isoformat(),
                    "crawler_cycle_id": 1,
                })
                link_id_counter += 1
                break

    generate_inter_site_links(l_top_devices, 40)
    generate_inter_site_links(p_top_devices, 30)

    # 3. Generate additional random links for all devices (background data / detail views)
    for device in core_devices:
        same_zone = [d for d in core_devices if d["coresite_id"] == device["coresite_id"] and d["id"] != device["id"]]
        other_zone = [d for d in core_devices if d["coresite_id"] != device["coresite_id"]]
        
        for _ in range(random.randint(2, 4)):
            if same_zone and random.random() < 0.5:
                neighbor = random.choice(same_zone)
            else:
                neighbor = random.choice(other_zone) if other_zone else random.choice(core_devices)
            
            if neighbor["id"] == device["id"]:
                continue
                
            pair = tuple(sorted([device["id"], neighbor["id"]]))
            if pair in created_pairs:
                continue
            created_pairs.add(pair)
            
            is_core = random.choice([True, False])
            links.append({
                "id": link_id_counter,
                "coredevice_id": device["id"],
                "neighbor_coredevice_id": neighbor["id"],
                "network_type_id": device.get("network_type_id", 1),
                "network_ids": device.get("network_ids", [1]),
                "neighbor_ip": neighbor["ip"],
                "neighbor_is_core": is_core,
                "description": f"Link between {device['name']} and {neighbor['name']}",
                "cdp": f"neighbor-switch-{fake.word()}",
                "physical_status": random.choice(["Up", "Down"]),
                "protocol_status": random.choice(["Up", "Down"]),
                "mpls_ldp": random.choice(["Enabled", "Disabled"]),
                "isis": random.choice(["Enabled", "Disabled"]),
                "espf_interface_address": fake.ipv4(),
                "bw": random.choice(["10G", "40G", "100G"]),
                "bandwidth": random.choice(["10G", "40G", "100G"]),
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
            })
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