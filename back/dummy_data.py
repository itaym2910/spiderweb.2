import random
import re
import collections
from faker import Faker
from datetime import datetime, timedelta

fake = Faker()

def generate_dummy_data():
    """
    Generates a complete, interconnected, realistic set of dummy data for the Spiderweb application.
    Supports multi-tier topologies: internal core links, inter-site trunks, resilient ring backbones,
    spine-leaf cross-connects, dual-homed diversity lines, long-haul optical transits, metropolitan meshes,
    campus aggregation lines, emergency bypass trunks, and cross-network peering.
    Guarantees at least 160 Up lines in both L-Network and P-Network charts with conflict-free port allocations.
    """
    print("Generating dummy data...")

    # --- Net Types ---
    net_types = [
        {"id": 1, "name": "L-Network (ns)"},
        {"id": 2, "name": "P-Network (anan-lekaman)"},
    ]

    # --- Core Sites (Pikudim) ---
    l_site_names = [
        "Pikud Merkaz",
        "Pikud Tzafon",
        "Pikud Darom",
        "Pikud Tel-Aviv",
        "Pikud Haifa",
        "Pikud Jerusalem",
    ]
    p_site_names = [
        "Pikud Negev",
        "Pikud Golan",
        "Pikud Eilat",
        "Pikud Shomron",
        "Pikud Galil",
    ]

    core_sites = []
    for i, name in enumerate(l_site_names, start=1):
        core_sites.append({"id": i, "name": name, "core_site_name": name, "network_ids": [1]})
    for i, name in enumerate(p_site_names, start=7):
        core_sites.append({"id": i, "name": name, "core_site_name": name, "network_ids": [2]})

    # --- Core Devices ---
    core_devices = []
    device_id_counter = 1
    # Priority order for device endings: 4, 5 (highest priority/spine), 1, 2 (border/gateway), 7, 8 (aggregation)
    allowed_endings = [4, 5, 1, 2, 7, 8]
    for cs in core_sites:
        num_devices = random.randint(5, 6)
        site_slug = cs["name"].lower().replace(" ", "_")
        is_l = 1 in cs["network_ids"]
        prefix = "H" if is_l else "P"
        for i in range(num_devices):
            ending = allowed_endings[i] if i < len(allowed_endings) else random.choice(allowed_endings)
            dev_name = f"rtr-{site_slug}-{prefix}{ending}"
            dev_ip = f"10.{cs['id']}.{ending}.1"
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
    for _ in range(160):
        site_name = fake.company()
        site_desc = fake.bs()
        site = {
            "id": site_id_counter,
            "name": site_name,
            "topology": "{}",
            "description": site_desc,
            "coredevice_ids": [random.choice(core_devices)["id"] for _ in range(random.randint(1, 2))]
        }
        sites.append(site)
        site_id_counter += 1
    
    # --- Links (Network Lines) Generation Infrastructure ---
    links = []
    link_id_counter = 1
    created_pairs = set()
    device_port_counter = collections.defaultdict(int)

    # Bandwidth mapping to Mbps
    bandwidth_map = {
        "10G": 10000,
        "40G": 40000,
        "100G": 100000,
        "400G": 400000,
    }

    def generate_ping_probe(phys_stat: str):
        """
        Generates realistic ping telemetry adhering to 10,000 packet benchmarks
        and probe loss profiles.
        """
        packets_tot = random.choices([5, 20, 100, 10000], weights=[0.10, 0.10, 0.15, 0.65])[0]
        if phys_stat == "Up":
            if packets_tot == 100:
                ping_rate = random.choices([100.0, 99.0, 95.0, 80.0, 60.0], weights=[0.78, 0.10, 0.05, 0.05, 0.02])[0]
            elif packets_tot == 10000:
                ping_rate = random.choices([100.0, 99.8, 99.5, 98.0, 80.0], weights=[0.75, 0.12, 0.07, 0.04, 0.02])[0]
            else:
                ping_rate = random.choices([100.0, 80.0, 60.0], weights=[0.85, 0.10, 0.05])[0]
        else:
            ping_rate = random.choices([0.0, 20.0, 40.0], weights=[0.85, 0.10, 0.05])[0]

        packets_succ = int(round((ping_rate / 100.0) * packets_tot))
        ping_ratio = f"{packets_succ}/{packets_tot}"
        return ping_rate, packets_succ, packets_tot, ping_ratio

    def calculate_optical_diagnostics(media_type: str, phys_stat: str):
        """
        Calculates realistic optical transceiver signal profiles, return loss,
        and receive/transmit power levels based on physical medium.
        """
        if phys_stat != "Up":
            return "-38.5 dBm", "-40.0 dBm"

        if media_type == "DWDM":
            rx_val = round(random.uniform(-14.0, -8.5), 1)
            tx_val = round(random.uniform(0.5, 3.2), 1)
        elif media_type == "Fiber":
            rx_val = round(random.uniform(-4.5, -2.1), 1)
            tx_val = round(random.uniform(-3.8, -1.8), 1)
        else:
            rx_val = round(random.uniform(-5.0, -2.5), 1)
            tx_val = round(random.uniform(-4.0, -2.0), 1)

        return f"{rx_val} dBm", f"{tx_val} dBm"

    def calculate_traffic_rates(bw_choice: str, phys_stat: str):
        """
        Calculates dynamic interface throughput utilization matching capacity limits.
        """
        if phys_stat != "Up":
            return "0.0 Gbps", "0.0 Gbps"

        if bw_choice == "400G":
            curr_in = round(random.uniform(45.0, 280.0), 1)
            curr_out = round(random.uniform(40.0, 265.0), 1)
        elif bw_choice == "100G":
            curr_in = round(random.uniform(12.0, 84.0), 1)
            curr_out = round(random.uniform(10.0, 78.0), 1)
        elif bw_choice == "40G":
            curr_in = round(random.uniform(4.5, 32.0), 1)
            curr_out = round(random.uniform(3.8, 29.5), 1)
        else:
            curr_in = round(random.uniform(0.9, 8.5), 1)
            curr_out = round(random.uniform(0.8, 8.2), 1)

        return f"{curr_in} Gbps", f"{curr_out} Gbps"

    def allocate_interface_for_device(dev, bw_choice: str):
        """
        Allocates a unique physical port on the device to prevent interface collisions
        during graph rendering and deduplication.
        """
        device_port_counter[dev["id"]] += 1
        p_num = device_port_counter[dev["id"]]
        slot = (p_num - 1) // 8
        port = (p_num - 1) % 8

        if bw_choice in ["100G", "400G"]:
            return f"HundredGigE0/{slot}/0/{port}"
        elif bw_choice == "40G":
            return f"FortyGigE0/{slot}/1/{port}"
        else:
            return f"GigabitEthernet0/{slot}/{port}"

    def create_link_record(
        dev1,
        dev2,
        link_type_desc="Core Backbone Link",
        bw_choice="10G",
        is_core=True,
        forced_status=None,
        media_type="Fiber",
        custom_network_ids=None
    ):
        """
        Comprehensive factory to instantiate a network line with full diagnostics,
        optical levels, unique interface slots, traffic rates, and protocol states.
        """
        nonlocal link_id_counter
        pair = tuple(sorted([dev1["id"], dev2["id"]]))
        created_pairs.add(pair)

        # 92% Up probability ensures that total Up lines comfortably exceed 160 per network
        phys_stat = forced_status if forced_status else random.choices(["Up", "Down"], weights=[0.92, 0.08])[0]
        ping_rate, packets_succ, packets_tot, ping_ratio = generate_ping_probe(phys_stat)

        # Optical diagnostics and traffic utilization
        rx_power, tx_power = calculate_optical_diagnostics(media_type, phys_stat)
        in_rate, out_rate = calculate_traffic_rates(bw_choice, phys_stat)

        # Allocate unique interface endpoints on both devices
        local_iface = allocate_interface_for_device(dev1, bw_choice)
        remote_iface = allocate_interface_for_device(dev2, bw_choice)

        status_changed_iso = (datetime.utcnow() - timedelta(hours=random.choice([random.uniform(0.1, 23), random.uniform(25, 160), random.uniform(170, 700)]))).isoformat()

        if phys_stat == "Up":
            rec_last_up = status_changed_iso
            rec_last_down = None
            # Real-world network scenario: ~88% of up links are OSPF Full,
            # ~6% dropped from Full (issue, last_ospf_full_at != None),
            # ~6% never established OSPF Full (up, last_ospf_full_at == None).
            ospf_choice = random.choices(["Full", "Dropped", "NeverFull"], weights=[0.88, 0.06, 0.06])[0]
            if ospf_choice == "Full":
                ospf_st = "Full"
                rec_last_ospf_full = status_changed_iso
            elif ospf_choice == "Dropped":
                ospf_st = "2-Way"
                rec_last_ospf_full = (datetime.utcnow() - timedelta(hours=random.uniform(24, 200))).isoformat()
            else:
                ospf_st = "2-Way"
                rec_last_ospf_full = None
        else:
            ospf_st = "Down"
            rec_last_up = None
            rec_last_down = status_changed_iso
            rec_last_ospf_full = None

        record = {
            "id": link_id_counter,
            "coredevice_id": dev1["id"],
            "neighbor_coredevice_id": dev2["id"],
            "network_type_id": dev1.get("network_type_id", 1),
            "network_ids": custom_network_ids or dev1.get("network_ids", [1]),
            "neighbor_ip": dev2["ip"],
            "neighbor_is_core": is_core,
            "description": f"{link_type_desc} between {dev1['name']} and {dev2['name']}",
            "cdp": f"neighbor-switch-{fake.word()}",
            "physical_status": phys_stat,
            "protocol_status": phys_stat,
            "mpls_ldp": "Enabled" if (phys_stat == "Up" and random.random() < 0.92) else "Disabled",
            "isis": "Enabled" if (phys_stat == "Up" and random.random() < 0.88) else "Disabled",
            "espf_interface_address": fake.ipv4(),
            "bw": bw_choice,
            "bandwidth": bw_choice,
            "bandwidth_mbps": bandwidth_map.get(bw_choice, 10000),
            "mtu": 9000 if bw_choice in ["40G", "100G", "400G"] else 1500,
            "ping_success_rate": ping_rate,
            "ping_packets_success": packets_succ,
            "ping_packets_total": packets_tot,
            "total_pings": packets_tot,
            "ping_total": packets_tot,
            "ping_ratio": ping_ratio,
            "last_ping_at": (datetime.utcnow() - timedelta(minutes=random.randint(1, 15))).isoformat(),
            "ospf_state": ospf_st,
            "media_type": media_type,
            "in_bps": in_rate,
            "out_bps": out_rate,
            "input_rate": in_rate,
            "output_rate": out_rate,
            "rx": rx_power,
            "tx": tx_power,
            "input_errors": str(random.randint(0, 10) if phys_stat == "Down" or ping_rate < 99 else 0),
            "output_errors": str(random.randint(0, 5) if phys_stat == "Down" or ping_rate < 99 else 0),
            "crc": str(random.randint(0, 2) if ping_rate < 99 else 0),
            "local_interface": local_iface,
            "remote_interface": remote_iface,
            "created_at": (datetime.utcnow() - timedelta(days=random.uniform(1, 45))).isoformat(),
            "updated_at": (datetime.utcnow() - timedelta(hours=random.choice([random.uniform(0.1, 23), random.uniform(25, 160), random.uniform(170, 700)]))).isoformat(),
            "status_changed_at": status_changed_iso,
            "last_up_at": rec_last_up,
            "last_down_at": rec_last_down,
            "last_ospf_full_at": rec_last_ospf_full,
            "crawler_cycle_id": 1,
        }
        link_id_counter += 1
        return record

    # 1. Connect the top 2 devices of each site internally (Same Site Lines)
    top_devices_by_site = {}
    priority_order = [4, 5, 1, 2, 7, 8]
    def get_priority(device):
        try:
            match = re.search(r'(\d+)(?!.*\d)', device["name"])
            ending = int(match.group(1)) if match else 99
            return priority_order.index(ending)
        except (ValueError, IndexError):
            return 99

    for cs in core_sites:
        site_devs = [d for d in core_devices if d["coresite_id"] == cs["id"]]
        site_devs.sort(key=get_priority)
        top_devices_by_site[cs["id"]] = site_devs[:2]
        
        # Add internal redundant trunk lines between site devices
        if len(site_devs) >= 2:
            dev1, dev2 = site_devs[0], site_devs[1]
            rec = create_link_record(
                dev1, dev2,
                link_type_desc="Internal Site Intra-Trunk Line",
                bw_choice="10G",
                is_core=True,
                forced_status="Up"
            )
            rec["ping_success_rate"] = 100.0
            rec["ping_packets_success"] = 10000
            rec["ping_packets_total"] = 10000
            rec["total_pings"] = 10000
            rec["ping_total"] = 10000
            rec["ping_ratio"] = "10000/10000"
            rec["ospf_state"] = "Full"
            links.append(rec)

    # 2. Extract Top Devices for L-Chart and P-Chart
    l_top_devices = []
    p_top_devices = []
    for cs_id, devs in top_devices_by_site.items():
        if cs_id <= 6:
            l_top_devices.extend(devs)
        else:
            p_top_devices.extend(devs)

    l_chart_devices = [d for d in core_devices if 1 in d.get("network_ids", [])]
    p_chart_devices = [d for d in core_devices if 2 in d.get("network_ids", [])]

    def generate_inter_site_links(dev_list, count, desc="Inter-Site Backbone Line", default_bw="10G", forced_status=None):
        for _ in range(count):
            if len(dev_list) < 2:
                break
            attempts = 0
            while attempts < 160:
                d1 = random.choice(dev_list)
                d2 = random.choice(dev_list)
                if d1["coresite_id"] == d2["coresite_id"]:
                    attempts += 1
                    continue
                pair = tuple(sorted([d1["id"], d2["id"]]))
                if pair in created_pairs:
                    attempts += 1
                    continue
                
                bw = default_bw if default_bw != "random" else random.choice(["10G", "40G", "100G"])
                rec = create_link_record(d1, d2, link_type_desc=desc, bw_choice=bw, is_core=True, forced_status=forced_status)
                links.append(rec)
                break

    # Generate primary visible inter-site backbone lines
    generate_inter_site_links(l_top_devices, 55, desc="L-Network Inter-Pikud Core Line", default_bw="10G", forced_status="Up")
    generate_inter_site_links(p_top_devices, 50, desc="P-Network Inter-Pikud Core Line", default_bw="10G", forced_status="Up")

    # 3. Ring Topology Lines (Resilient Closed Backbone Rings)
    # L-Network Ring: Merkaz -> Tel-Aviv -> Jerusalem -> Darom -> Haifa -> Tzafon -> Merkaz
    l_ring_order = [1, 4, 6, 3, 5, 2] # site IDs
    for idx in range(len(l_ring_order)):
        cs1_id = l_ring_order[idx]
        cs2_id = l_ring_order[(idx + 1) % len(l_ring_order)]
        devs1 = top_devices_by_site.get(cs1_id, [])
        devs2 = top_devices_by_site.get(cs2_id, [])
        if devs1 and devs2:
            d1 = devs1[0]
            d2 = devs2[0]
            pair = tuple(sorted([d1["id"], d2["id"]]))
            if pair not in created_pairs:
                links.append(create_link_record(d1, d2, link_type_desc="L-Ring Primary Backbone Line", bw_choice="40G", is_core=True, forced_status="Up"))
            
            # Secondary ring line between secondary top devices
            if len(devs1) > 1 and len(devs2) > 1:
                sd1 = devs1[1]
                sd2 = devs2[1]
                spair = tuple(sorted([sd1["id"], sd2["id"]]))
                if spair not in created_pairs:
                    links.append(create_link_record(sd1, sd2, link_type_desc="L-Ring Secondary Diversity Line", bw_choice="40G", is_core=True, forced_status="Up"))

    # P-Network Ring: Negev -> Golan -> Eilat -> Shomron -> Galil -> Negev
    p_ring_order = [7, 8, 9, 10, 11] # site IDs
    for idx in range(len(p_ring_order)):
        cs1_id = p_ring_order[idx]
        cs2_id = p_ring_order[(idx + 1) % len(p_ring_order)]
        devs1 = top_devices_by_site.get(cs1_id, [])
        devs2 = top_devices_by_site.get(cs2_id, [])
        if devs1 and devs2:
            d1 = devs1[0]
            d2 = devs2[0]
            pair = tuple(sorted([d1["id"], d2["id"]]))
            if pair not in created_pairs:
                links.append(create_link_record(d1, d2, link_type_desc="P-Ring Primary Backbone Line", bw_choice="40G", is_core=True, forced_status="Up"))
            if len(devs1) > 1 and len(devs2) > 1:
                sd1 = devs1[1]
                sd2 = devs2[1]
                spair = tuple(sorted([sd1["id"], sd2["id"]]))
                if spair not in created_pairs:
                    links.append(create_link_record(sd1, sd2, link_type_desc="P-Ring Secondary Diversity Line", bw_choice="40G", is_core=True, forced_status="Up"))

    # 4. High-Capacity Spine-Leaf Core Lines (100G / 400G Mesh)
    high_cap_l_devs = [d for d in l_chart_devices if any(d["name"].endswith(str(x)) for x in [4, 5])]
    high_cap_p_devs = [d for d in p_chart_devices if any(d["name"].endswith(str(x)) for x in [4, 5])]

    generate_inter_site_links(high_cap_l_devs, 55, desc="High-Speed Spine Interconnect Line", default_bw="100G", forced_status="Up")
    generate_inter_site_links(high_cap_p_devs, 65, desc="High-Speed Spine Interconnect Line", default_bw="100G", forced_status="Up")

    # 5. Long-Haul DWDM Transit Lines (Connecting North <-> South Core Sites)
    l_north_devs = [d for d in l_chart_devices if d["coresite_id"] in [2, 5]] # Tzafon, Haifa
    l_south_devs = [d for d in l_chart_devices if d["coresite_id"] in [3, 4]] # Darom, Tel-Aviv
    for _ in range(45):
        if not l_north_devs or not l_south_devs:
            break
        nd = random.choice(l_north_devs)
        sd = random.choice(l_south_devs)
        pair = tuple(sorted([nd["id"], sd["id"]]))
        if pair not in created_pairs:
            links.append(create_link_record(nd, sd, link_type_desc="L-Network Long-Haul DWDM Transit Line", bw_choice="100G", is_core=True, media_type="DWDM", forced_status="Up"))

    p_north_devs = [d for d in p_chart_devices if d["coresite_id"] in [8, 11]] # Golan, Galil
    p_south_devs = [d for d in p_chart_devices if d["coresite_id"] in [7, 9]]  # Negev, Eilat
    for _ in range(60):
        if not p_north_devs or not p_south_devs:
            break
        nd = random.choice(p_north_devs)
        sd = random.choice(p_south_devs)
        pair = tuple(sorted([nd["id"], sd["id"]]))
        if pair not in created_pairs:
            links.append(create_link_record(nd, sd, link_type_desc="P-Network Long-Haul DWDM Transit Line", bw_choice="100G", is_core=True, media_type="DWDM", forced_status="Up"))

    # 6. Metropolitan Area Network (MAN) Hub Meshes
    metro_l_devs = [d for d in l_chart_devices if d["coresite_id"] in [1, 4, 6]] # Merkaz, Tel-Aviv, Jerusalem
    for _ in range(50):
        if len(metro_l_devs) < 2:
            break
        d1 = random.choice(metro_l_devs)
        d2 = random.choice(metro_l_devs)
        if d1["coresite_id"] == d2["coresite_id"]:
            continue
        pair = tuple(sorted([d1["id"], d2["id"]]))
        if pair not in created_pairs:
            links.append(create_link_record(d1, d2, link_type_desc="Metropolitan High-Throughput MAN Line", bw_choice="40G", is_core=True, forced_status="Up"))

    metro_p_devs = [d for d in p_chart_devices if d["coresite_id"] in [7, 10]] # Negev, Shomron
    for _ in range(50):
        if len(metro_p_devs) < 2:
            break
        d1 = random.choice(metro_p_devs)
        d2 = random.choice(metro_p_devs)
        if d1["coresite_id"] == d2["coresite_id"]:
            continue
        pair = tuple(sorted([d1["id"], d2["id"]]))
        if pair not in created_pairs:
            links.append(create_link_record(d1, d2, link_type_desc="P-Network Regional Hub Interconnect Line", bw_choice="40G", is_core=True, forced_status="Up"))

    # 7. Cross-Network Peering Lines (L-Network <-> P-Network Border Gateways)
    l_border_devs = [d for d in l_top_devices if any(d["name"].endswith(str(x)) for x in [1, 2])]
    p_border_devs = [d for d in p_top_devices if any(d["name"].endswith(str(x)) for x in [1, 2])]
    for _ in range(35):
        if not l_border_devs or not p_border_devs:
            break
        d_l = random.choice(l_border_devs)
        d_p = random.choice(p_border_devs)
        pair = tuple(sorted([d_l["id"], d_p["id"]]))
        if pair not in created_pairs:
            rec = create_link_record(d_l, d_p, link_type_desc="Cross-Network Gateway Peering Line", bw_choice="40G", is_core=True, custom_network_ids=[1, 2], forced_status="Up")
            links.append(rec)

    # 8. Campus & Leaf Aggregation Lines (Connecting aggregation devices 7, 8 to spine routers)
    for cs in core_sites:
        site_devs = [d for d in core_devices if d["coresite_id"] == cs["id"]]
        spine_devs = [d for d in site_devs if any(d["name"].endswith(str(x)) for x in [4, 5])]
        leaf_devs = [d for d in site_devs if any(d["name"].endswith(str(x)) for x in [7, 8, 1, 2])]
        for leaf in leaf_devs:
            for spine in spine_devs:
                pair = tuple(sorted([leaf["id"], spine["id"]]))
                if pair not in created_pairs:
                    links.append(create_link_record(leaf, spine, link_type_desc="Site Aggregation Distribution Line", bw_choice="10G", is_core=True, forced_status="Up"))

    # 9. Emergency Redundant Bypass Trunks
    critical_pairs = [(1, 3), (1, 6), (2, 5), (7, 9), (8, 10)]
    for c1, c2 in critical_pairs:
        d1_list = [d for d in core_devices if d["coresite_id"] == c1]
        d2_list = [d for d in core_devices if d["coresite_id"] == c2]
        if d1_list and d2_list:
            d_a = d1_list[0]
            d_b = d2_list[0]
            pair = tuple(sorted([d_a["id"], d_b["id"]]))
            if pair not in created_pairs:
                links.append(create_link_record(d_a, d_b, link_type_desc="Emergency Rapid-Failover Bypass Trunk", bw_choice="100G", is_core=True, forced_status="Up"))

    # 10. Secondary Diversity Intra-Site Trunk Lines
    for cs in core_sites:
        site_devs = [d for d in core_devices if d["coresite_id"] == cs["id"]]
        if len(site_devs) >= 4:
            d3, d4 = site_devs[2], site_devs[3]
            pair = tuple(sorted([d3["id"], d4["id"]]))
            if pair not in created_pairs:
                links.append(create_link_record(d3, d4, link_type_desc="Auxiliary Site Resilience Line", bw_choice="10G", is_core=True, forced_status="Up"))

    # 11. Additional Background Lines for Network Balance
    # Ensure both L-Network and P-Network have substantial line density
    for network_devices, target_count, net_desc in [(l_chart_devices, 40, "L-Network Expansion Line"), (p_chart_devices, 75, "P-Network Expansion Line")]:
        added = 0
        for _ in range(target_count):
            if len(network_devices) < 2:
                break
            d1 = random.choice(network_devices)
            d2 = random.choice(network_devices)
            if d1["id"] == d2["id"] or d1["coresite_id"] == d2["coresite_id"]:
                continue
            pair = tuple(sorted([d1["id"], d2["id"]]))
            if pair not in created_pairs:
                added += 1
                f_stat = "Down" if added in [3, 6] else "Up"
                links.append(create_link_record(d1, d2, link_type_desc=net_desc, bw_choice="10G", is_core=True, forced_status=f_stat))

    # --- Users ---
    users = [
        {"id": 1, "username": "admin", "role": "admin", "favorite_links": [1, 3, 5, 8, 12, 18, 25]},
        {"id": 2, "username": "userg", "role": "user", "favorite_links": [2, 4, 7, 10, 16, 22]},
        {"id": 3, "username": "noc_operator", "role": "user", "favorite_links": [1, 2, 6, 9]},
        {"id": 4, "username": "net_engineer", "role": "user", "favorite_links": [3, 4, 11, 15]},
        {"id": 5, "username": "security_lead", "role": "admin", "favorite_links": [5, 12, 18]},
        {"id": 6, "username": "dana_cohen", "role": "user", "favorite_links": [2, 8, 14]},
        {"id": 7, "username": "itay_m", "role": "admin", "favorite_links": [1, 4, 7, 10]},
        {"id": 8, "username": "ron_levy", "role": "user", "favorite_links": [6, 13, 20]},
        {"id": 9, "username": "devops_guy", "role": "user", "favorite_links": [3, 9, 17]},
        {"id": 10, "username": "sys_analyst", "role": "user", "favorite_links": [2, 5, 11]},
    ]
    
    # --- Alerts ---
    alerts = []
    alert_id_counter = 1
    for _ in range(85):
        device = random.choice(core_devices)
        alert = {
            "id": alert_id_counter,
            "type": random.choice(["error", "warning", "info"]),
            "message": fake.sentence(nb_words=6),
            "timestamp": (datetime.utcnow() - timedelta(minutes=random.randint(1, 1440))).isoformat(),
            "network_line": f"Line-{random.randint(1, 30)}",
            "source": f"System-{random.choice(['A', 'B', 'C', 'D'])}",
            "severity_score": random.randint(1, 10),
            "details": {"info": fake.sentence(), "remediation": "Check device and line logs."},
            "draw_number": 1,
            "coredevice_name": device["name"],
            "coredevice_id": device["id"]
        }
        alerts.append(alert)
        alert_id_counter += 1

    # --- Networks (associating sites and devices) ---
    networks = [
        {"id": 1, "name": "L-Network (ns)"},
        {"id": 2, "name": "P-Network (anan-lekaman)"},
    ]

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
        (100, 0.1, 23.5),    # < 24h (last day)
        (130, 24.5, 167.0),  # 1 - 7 days (< 1 week)
        (130, 168.0, 715.0), # 7 - 30 days (< 1 month)
        (60, 720.0, 1440.0), # > 30 days
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
            link["physical_status"] = latest["new_oper_status"]
            link["protocol_status"] = latest["new_oper_status"]
            link["ospf_state"] = latest["new_ospf_state"]
            if latest["new_oper_status"] == "Down":
                link["last_down_at"] = latest["created_at"]
            elif latest["new_oper_status"] == "Up":
                link["last_up_at"] = latest["created_at"]
            if latest["new_ospf_state"] == "Full":
                link["last_ospf_full_at"] = latest["created_at"]
            elif latest["old_ospf_state"] == "Full" and not link.get("last_ospf_full_at"):
                link["last_ospf_full_at"] = (datetime.fromisoformat(latest["created_at"]) - timedelta(hours=random.uniform(1, 10))).isoformat()

    # --- Core Site Traffic (Inbound and Outbound) ---
    core_site_traffic = {}
    for cs in core_sites:
        total_in = round(random.uniform(12.5, 450.0), 1)
        total_out = round(random.uniform(10.0, 420.0), 1)
        core_site_traffic[cs["id"]] = {
            "id": cs["id"],
            "traffic": {
                "in": f"{total_in} Gbps",
                "out": f"{total_out} Gbps",
            },
        }

    print(f"Dummy data generation complete. Generated {len(links)} network lines and {len(link_status_events)} events.")
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
        "core_site_traffic": core_site_traffic,
        "crawler_cycle": {"id": 1, "count": 125}
    }

# Generate and store data in a variable
DUMMY_DB = generate_dummy_data()