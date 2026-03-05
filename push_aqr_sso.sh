#!/bin/bash
echo "Navigating to AQR project..."
cd /Users/solomonroth/AQR/aqr-project-estimator || exit 1
echo "Staging changes..."
git add .
echo "Committing..."
git commit -m "feat: implement Google SSO with email allowlist"
echo "Pushing to remote..."
git push origin main
echo "Done!"
