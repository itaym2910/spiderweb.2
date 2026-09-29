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
        {"id": 1, "name": "L-Network (ns)"},
        {"id": 2, "name": "P-Network (anan-lekaman)"},
    ]

    # --- Core Sites (Pikudim) ---
    l_site_names = ["Pikud Merkaz", "Pikud Tzafon", "Pikud Darom", "Pikud Tel-Aviv", "Pikud Haifa", "Pikud Jerusalem"]
    p_site_names = ["Pikud Negev", "Pikud Golan", "Pikud Eilat", "Pikud Shomron", "Pikud Galil"]

    core_sites = []
    for i, name in enumerate(l_site_names, start=1):
        core_sites.append({"id": i, "name": name, "core_site_name": name, "network_ids": [1]})
    for i, name in enumerate(p_site_names, start=7):
        core_sites.append({"id": i, "name": name, "core_site_name": name, "network_ids": [2]})

    # --- Core Devices ---
    core_devices = []
    device_id_counter = 1
    allowed_endings = [4, 5, 1, 2, 7, 8]
    for cs in core_sites:
        num_devices = random.randint(3, 6)
        site_slug = cs["name"].lower().replace(" ", "_")
        is_l = 1 in cs["network_ids"]
        prefix = "H" if is_l else "P"
        for i in range(num_devices):
            ending = allowed_endings[i] if i < len(allowed_endings) else random.choice(allowed_endings)
            dev_name = f"rtr-{site_slug}-{prefix}{ending}"
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
                import re
                match = re.search(r'(\d+)(?!.*\d)', device["name"])
                ending = int(match.group(1)) if match else 99
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
                "bandwidth_mbps": 10000,
                "mtu": 1500,
                "ping_success_rate": 100.0,
                "ping_packets_success": 10000,
                "ping_packets_total": 10000,
                "total_pings": 10000,
                "ping_total": 10000,
                "ping_ratio": "10000/10000",
                "last_ping_at": datetime.utcnow().isoformat(),
                "ospf_state": "Full",
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

    def generate_ping_probe(phys_stat: str):
        # Variety of probe sizes: 5, 20, 100, 10000
        packets_tot = random.choices([5, 20, 100, 10000], weights=[0.45, 0.15, 0.25, 0.15])[0]
        if phys_stat == "Up":
            if packets_tot == 100:
                ping_rate = random.choices([100.0, 99.0, 95.0, 80.0, 60.0], weights=[0.75, 0.10, 0.05, 0.07, 0.03])[0]
            elif packets_tot == 10000:
                ping_rate = random.choices([100.0, 99.5, 80.0, 60.0], weights=[0.70, 0.15, 0.10, 0.05])[0]
            else:
                ping_rate = random.choices([100.0, 80.0, 60.0], weights=[0.80, 0.15, 0.05])[0]
        else:
            ping_rate = random.choices([0.0, 20.0, 40.0], weights=[0.80, 0.10, 0.10])[0]

        packets_succ = int(round((ping_rate / 100.0) * packets_tot))
        ping_ratio = f"{packets_succ}/{packets_tot}"
        return ping_rate, packets_succ, packets_tot, ping_ratio

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
                
                phys_stat = random.choice(["Up", "Up", "Up", "Down"])
                ping_rate, packets_succ, packets_tot, ping_ratio = generate_ping_probe(phys_stat)
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
                    "physical_status": phys_stat,
                    "protocol_status": phys_stat,
                    "mpls_ldp": "Enabled",
                    "isis": "Enabled",
                    "espf_interface_address": fake.ipv4(),
                    "bw": "10G",
                    "bandwidth": "10G",
                    "bandwidth_mbps": 10000,
                    "mtu": 1500,
                    "ping_success_rate": ping_rate,
                    "ping_packets_success": packets_succ,
                    "ping_packets_total": packets_tot,
                    "total_pings": packets_tot,
                    "ping_total": packets_tot,
                    "ping_ratio": ping_ratio,
                    "last_ping_at": (datetime.utcnow() - timedelta(minutes=random.randint(1, 10))).isoformat(),
                    "ospf_state": "Full" if (phys_stat == "Up" and ping_rate >= 80.0) else ("2-Way" if phys_stat == "Up" else "Down"),
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
            p_status = random.choice(["Up", "Up", "Down"])
            ping_rate, packets_succ, packets_tot, ping_ratio = generate_ping_probe(p_status)

            bw_choice = random.choice(["10G", "40G", "100G"])
            bw_map = {"10G": 10000, "40G": 40000, "100G": 100000}
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
                "physical_status": p_status,
                "protocol_status": p_status,
                "mpls_ldp": random.choice(["Enabled", "Disabled"]),
                "isis": random.choice(["Enabled", "Disabled"]),
                "espf_interface_address": fake.ipv4(),
                "bw": bw_choice,
                "bandwidth": bw_choice,
                "bandwidth_mbps": bw_map.get(bw_choice, 10000),
                "mtu": 1500,
                "ping_success_rate": ping_rate,
                "ping_packets_success": packets_succ,
                "ping_packets_total": packets_tot,
                "total_pings": packets_tot,
                "ping_total": packets_tot,
                "ping_ratio": ping_ratio,
                "last_ping_at": (datetime.utcnow() - timedelta(minutes=random.randint(1, 15))).isoformat(),
                "ospf_state": "Full" if (p_status == "Up" and ping_rate >= 80.0) else ("2-Way" if p_status == "Up" else "Down"),
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
        {"id": 1, "name": "L-Network (ns)"},
        {"id": 2, "name": "P-Network (anan-lekaman)"},
    ]

    # Ensure all links have local_interface and remote_interface defined
    for link in links:
        link["local_interface"] = f"GigabitEthernet0/{link['id'] % 4}"
        link["remote_interface"] = f"GigabitEthernet0/{(link['id'] + 1) % 4}"

    # --- Link Status Events (history of status changes) ---
    link_status_events = []
    event_id_counter = 1

    # Transition templates matching the frontend event types and status states
    transition_templates = [
        {
            "event_type": "link_down",
            "old_oper_status": "Up",
            "new_oper_status": "Down",
            "old_ospf_state": "Full",
            "new_ospf_state": "Down",
            "reason": "Interface link down (carrier lost)",
        },
        {
            "event_type": "link_up",
            "old_oper_status": "Down",
            "new_oper_status": "Up",
            "old_ospf_state": "Down",
            "new_ospf_state": "Full",
            "reason": "Interface link restored to service",
        },
        {
            "event_type": "ospf_drop",
            "old_oper_status": "Up",
            "new_oper_status": "Up",
            "old_ospf_state": "Full",
            "new_ospf_state": "Down",
            "reason": "OSPF neighbor adjacency lost (dead timer expired)",
        },
        {
            "event_type": "ospf_full",
            "old_oper_status": "Up",
            "new_oper_status": "Up",
            "old_ospf_state": "2-Way",
            "new_ospf_state": "Full",
            "reason": "OSPF adjacency state reached Full",
        },
    ]

    core_links = [l for l in links if l.get("neighbor_is_core")]
    other_links = [l for l in links if not l.get("neighbor_is_core")]

    now = datetime.utcnow()

    # Time distribution windows: (count, min_hours_ago, max_hours_ago)
    # Generates a realistic distribution across < 24h, < 1 week, and < 1 month
    time_windows = [
        (35, 0.1, 23.5),     # < 24h (last day)
        (45, 24.5, 167.0),   # 1 - 7 days (< 1 week)
        (45, 168.0, 715.0),  # 7 - 30 days (< 1 month)
        (15, 720.0, 1440.0), # > 30 days
    ]

    for count, min_h, max_h in time_windows:
        for _ in range(count):
            # Prioritize core-to-core links so they appear under 'Visible on Map'
            if core_links and (random.random() < 0.75 or not other_links):
                link = random.choice(core_links)
            else:
                link = random.choice(links)

            device = next((d for d in core_devices if d["id"] == link["coredevice_id"]), None)
            neighbor = next((d for d in core_devices if d["id"] == link["neighbor_coredevice_id"]), None)
            if not device or not neighbor:
                continue

            coresite = next((cs for cs in core_sites if cs["id"] == device["coresite_id"]), None)
            network = next((n for n in networks if n["id"] == device.get("network_type_id", 1)), None)
            tmpl = random.choice(transition_templates)

            event_time = now - timedelta(hours=random.uniform(min_h, max_h))
            event_time_iso = event_time.isoformat()

            link_status_events.append({
                "id": event_id_counter,
                "link_id": link["id"],
                "local_device_id": device["id"],
                "local_device_name": device["name"],
                "remote_device_id": neighbor["id"],
                "remote_device_name": neighbor["name"],
                "local_interface": link["local_interface"],
                "remote_interface": link["remote_interface"],
                "event_type": tmpl["event_type"],
                "old_oper_status": tmpl["old_oper_status"],
                "new_oper_status": tmpl["new_oper_status"],
                "old_ospf_state": tmpl["old_ospf_state"],
                "new_ospf_state": tmpl["new_ospf_state"],
                "old_status": tmpl["old_oper_status"].lower(),
                "new_status": tmpl["new_oper_status"].lower(),
                "created_at": event_time_iso,
                "changed_at": event_time_iso,
                "device_name": device["name"],
                "coresite_name": coresite["name"] if coresite else "Unknown",
                "network_name": network["name"] if network else "Unknown",
                "network_type_id": device.get("network_type_id", 1),
                "details": {
                    "reason": tmpl["reason"],
                    "description": f"{device['name']} {link['local_interface']} -> {neighbor['name']} {link['remote_interface']} [{tmpl['event_type'].upper()}]",
                },
            })
            event_id_counter += 1

    # Sort events newest first
    link_status_events.sort(key=lambda e: e["created_at"], reverse=True)

    # Synchronize each link's status timestamp with its most recent event
    for link in links:
        evs = [e for e in link_status_events if e["link_id"] == link["id"]]
        if evs:
            latest = evs[0]
            link["status_changed_at"] = latest["created_at"]
            if latest["new_oper_status"] == "Down":
                link["last_down_at"] = latest["created_at"]
            elif latest["new_oper_status"] == "Up":
                link["last_up_at"] = latest["created_at"]
            if latest["new_ospf_state"] == "Full":
                link["last_ospf_full_at"] = latest["created_at"]

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
        "link_status_events": link_status_events,
        "crawler_cycle": {"id": 1, "count": 125}
    }

# Generate and store data in a variable
DUMMY_DB = generate_dummy_data()