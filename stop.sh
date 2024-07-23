#!/bin/bash

pm2 stop sales-app
pm2 delete sales-app
pm2 save
