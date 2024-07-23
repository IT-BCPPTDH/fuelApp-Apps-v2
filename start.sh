#!/bin/bash

pm2 start --name=sales-app bun -- run preview
#pm2 start --name=sales-app bun -- dev
pm2 save
