#!/bin/bash
echo "=================================================="
echo "     Android RCE Exploit & Detection PoC Launcher"
echo "=================================================="
echo ""
python3 src/exploit_sim.py | python3 src/detector.py
echo ""
read -p "Devam etmek için Enter tuşuna basın..."
