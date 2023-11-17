#!/bin/bash

cd ..

zip -r rocket_pilot_server.zip . -x "scripts/*" -x "node_modules/*" -x "dist/*" -x "secrets/*"
