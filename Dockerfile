FROM eclipse-mosquitto

COPY mosquitto.conf  /mosquitto/config/mosquitto.conf
COPY dist/ /www/

VOLUME /data

EXPOSE 9001

CMD ["sh", "-c", "chown mosquitto /data && /usr/sbin/mosquitto -c /mosquitto/mosquitto/mosquitto.conf"]