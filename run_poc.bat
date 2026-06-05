@echo off
echo ==================================================
echo      Android RCE Exploit ve Detection PoC Launcher
echo ==================================================
echo.
python src/exploit_sim.py | python src/detector.py
echo.
pause
