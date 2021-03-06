#!/bin/sh

export DBUS_SYSTEM_BUS_ADDRESS=unix:path=/host/run/dbus/system_bus_socket

until
    curl -sXGET "$BALENA_SUPERVISOR_ADDRESS/v1/device?apikey=$BALENA_SUPERVISOR_API_KEY" |
    tr -d '[:cntrl:]' | grep '"update_pending":false' | grep -q '"status":"Idle"'
    do
        echo "Update in progress, waiting"
        sleep 30
done

if [ -d /tmp/www ]; then
    cp -r /www/* /tmp/www/
    /usr/sbin/wifi-connect -u /tmp/www
else
    /usr/sbin/wifi-connect -u /www
fi

sleep infinity
