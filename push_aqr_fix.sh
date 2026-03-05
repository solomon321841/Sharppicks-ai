#!/bin/bash
echo "Navigating to AQR project..."
cd /Users/solomonroth/AQR/aqr-project-estimator || exit 1
echo "Staging changes..."
git add src/components/ActionBar.jsx
echo "Committing..."
git commit -m "feat: configure contract button webhook"
echo "Pushing to remote..."
git push origin main
echo "Done!"
