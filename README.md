## DHCP and DNS
```sh
/usr/sbin/dnsmasq \
    --interface="<name_of_interface>" \
    --execpt-interface=lo \
    --bind-interfaces \
    --dhcp-range="<ip_of_subnet>" \
    --leasefile-ro  \
    --address="/#/<ip_of_portal>"
```

## MQTT
All static data and broker communication could be provided with this mosquitto configuration:
```properties
listener 9001
protocol websockets
http_dir /www/
allow_anonymous true
# optional persistance
persistence true
persistence_file mosquitto.db
persistence_location /data/
```

## Web
Instead of self-hosted MQTT broker a webserver and a public broker is also possible. Just deploy everything in `dist` directory to your webserver.

## OpenWrt
1. create bridge device `portal`
2. create wifi network(s) on interface `portal`
3. disable dns and dhcp on `portal` interface
4. install `mosquitto-ssl` (`*-nossl` doesn't support websockets)
5. move `luci` web interface to different port
6. add additional `uhttpd` config for port `80` (see https://openwrt.org/docs/guide-user/services/webserver/uhttpd)
   ```
   config uhttpd 'portal'
       list   listen_http '0.0.0.0:80'
       list   listen_http '[::]:80'
       option home        '/www2'
       option cgi_prefix  '/'
       option index_page  'portal'
   ```
7. create captive portal redirect in `/www2/portal`
   ```
   #!/bin/sh
   printf "Status: 302 Moved Temporarily\nLocation: http://%s:9001\n\n" "$SERVER_NAME"
   ```
5. start custom `dnsmasq` and `mosquitto` on boot