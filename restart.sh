#!/bin/bash

bun run build

pm2 stop sales-app
pm2 delete sales-app
pm2 save

pm2 start --name=sales-app bun -- run preview
pm2 save