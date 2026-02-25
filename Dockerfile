FROM eclipse-mosquitto:2.0

COPY mosquitto.conf  /mosquitto/config/mosquitto.conf
COPY dist/ /www/

# deactivated for railway.com
#VOLUME /data

EXPOSE 9001

CMD ["sh", "-c", "chown mosquitto /data && /usr/sbin/mosquitto -c /mosquitto/config/mosquitto.conf"]