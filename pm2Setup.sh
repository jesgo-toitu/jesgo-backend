pm2 start ./pm2-service.json --env production
sudo pm2 startup systemd -u jesgoServer

